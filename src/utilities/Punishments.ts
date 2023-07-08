// import { APIEmbed, Guild } from "discord.js";
// import { prisma } from "./Prisma.js";
// import { Case, CaseWithReference } from "../types/Punishment.js";

import AsyncLock from "async-lock";
import { APIEmbed, ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild, Snowflake } from "discord.js";
import { Case, CaseWithReference } from "../types/Punishment.js";
import { prisma } from "./Prisma.js";
import { Time } from "@sapphire/time-utilities";
import { redis } from "./Redis.js";
import { PunishmentScheduledTaskManager } from "../tasks/PunishmentExpiration.js";
import { CaseAction } from "@prisma/client";
import { postModLogMessage } from "./Logging.js";
import { Job } from "bullmq";

export const PunishmentLock = new AsyncLock();

const RedisLock = new AsyncLock();
export async function getCaseId(guildId: Snowflake): Promise<number> {
    return new Promise((resolve, reject) => {
        void RedisLock.acquire(`caseid-${guildId}`, async () => {
            const id = await redis.incr(`p-id-${guildId}`);
            resolve(id);
        }).catch(reject);
    });
}

export function convertActionToColor(action: CaseAction): number {
    switch (action) {
    case "Warn":
    case "Timeout":
    case "VMute":
    case "VDeafen":
        return 0xffca3a;
    case "Kick":
    case "Softban":
        return 0xffa05e;
    case "Untimeout":
        return 0x1e1e21;
    case "Unban":
        return 0x8ac926;
    case "Ban":
        return 0xff595e;
    }
}

export function prettifyCaseActionName(action: CaseAction) {
    switch (action) {
    case "VMute":
        return "Voice Mute";
    case "VDeafen":
        return "Voice Deafen";
    default:
        return action;
    }
}

export async function createCase(guild: Guild, data: Case, { dm, dry } = { dm: true, dry: false }): Promise<[CaseWithReference, APIEmbed]> {
    await prisma.guild.upsert({ create: { id: guild.id }, update: {}, where: { id: guild.id } });

    const punishment = await prisma.punishment.create({ 
        data: { 
            ...data,
            duration: data.duration ? data.duration / Time.Second : null,
            caseId: await getCaseId(guild.id) 
        },
        include: {
            caseReference: true
        }
    });

    // If the punishment has a duration
    // Extend the length of the punishment if it already exists and update the data to match the new case
    // Else create a new job for it and then do it
    if(data.duration) {
        const key = `punishment-jid-${data.action === "VMute" ? "VDeafen" : data.action}-${data.userId}`;

        // scoped by action so its only repeated punishments of same type updated
        let jobId = await redis.get(key);
        const job = jobId ? await Job.fromId(PunishmentScheduledTaskManager.queue, jobId) : null;

        if(job)  {
            await job.changeDelay(data.duration);
            await job.updateData(punishment);
        }
        else jobId = (await PunishmentScheduledTaskManager.schedule(punishment, { delay: data.duration })).id!;

        await redis.setex(key, data.duration / Time.Second, jobId!);
    }

    const moderator = (await guild.members.fetch(data.moderatorId)).user;
    const embed = await postModLogMessage(guild, moderator, punishment);

    if(dry) return [punishment, embed]; // Dry exits before executing moderation action

    try {
        if(dm && data.action !== "Unban") {
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId("void").setDisabled(true).setStyle(ButtonStyle.Primary).setLabel(`Sent from ${guild.name}`)
            );

            await guild.client.users.send(data.userId, { embeds: [embed], components: [row] });
        }
    } catch(_err) {}  // TODO: add sentry tracking + log errors to user

    try {
        if(data.action === "Ban") {
            await guild.members.ban(data.userId, { deleteMessageSeconds: (Time.Day * 7 ) / Time.Second, reason: data.reason });
        } else if(data.action === "Kick") {
            await guild.members.kick(data.userId, data.reason );
        } else if(data.action === "Softban") {
            await guild.members.ban(data.userId, { deleteMessageSeconds: (Time.Day * 7 ) / Time.Second, reason: data.reason });
            await guild.bans.remove(data.userId, "Removing softban");
        } else if(data.action === "Timeout") {
            await guild.members.edit(data.userId, { communicationDisabledUntil: new Date(Date.now() + data.duration!), reason: data.reason });
        } else if(data.action === "Unban") {
            await guild.bans.remove(data.userId, data.reason);
        } else if(data.action === "Untimeout") {
            await guild.members.edit(data.userId, { communicationDisabledUntil: null });
        } else if(data.action === "VDeafen") {
            await guild.members.edit(data.userId, { mute: true, deaf: true });
        } else if(data.action === "VMute") {
            await guild.members.edit(data.userId, { mute: true });
        }
    } catch (_err) {}  // TODO: add sentry tracking + log errors to user

    return [punishment, embed];
}