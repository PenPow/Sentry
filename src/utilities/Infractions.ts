import AsyncLock from "async-lock";
import { APIEmbed, ActionRowBuilder, ButtonBuilder, ButtonStyle, DiscordAPIError, Guild, Snowflake } from "discord.js";
import { Case, CaseWithReference } from "../types/Infraction.js";
import { prisma } from "./Prisma.js";
import { Time } from "@sapphire/time-utilities";
import { redis } from "./Redis.js";
import { InfractionScheduledTaskManager } from "../tasks/InfractionExpiration.js";
import { CaseAction } from "@prisma/client";
import { postModLogMessage } from "./Logging.js";
import { Job } from "bullmq";
import * as Sentry from "@sentry/node";
import { createErrorEmbed } from "../functions/createErrorEmbed.js";
import { InternalError } from "../lib/framework/structures/errors/InternalError.js";

export const InfractionLock = new AsyncLock();

const RedisLock = new AsyncLock();
export function getCaseId(guildId: Snowflake): Promise<number> {
    return new Promise((resolve, reject) => {
        if(import.meta.vitest) return resolve(1); // manual stub

        void RedisLock.acquire(`caseid-${guildId}`, async () => {
            const id = await redis.incr(`p-id-${guildId}`);
            return resolve(id);
        }).catch(reject);
    });
}

export async function isCaseFrozen(caseId: number, guildId: Snowflake) {
    const { frozen } = await prisma.infraction.findUnique({ where: { guildId_caseId: { guildId, caseId }}}) ?? { frozen: false };

    return frozen;
}

export function convertActionToColor(action: CaseAction): number {
    switch (action) {
    case "Warn":
    case "Timeout":
    case "VMute":
    case "Deafen":
        return 0xffca3a;
    case "Kick":
    case "Softban":
        return 0xffa05e;
    case "Untimeout":
    case "VUnmute":
    case "Undeafen":
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
    case "VUnmute":
        return "Remove Voice Mute";
    default:
        return action;
    }
}

export async function createCase(guild: Guild, data: Case, { dm, dry } = { dm: true, dry: false }): Promise<[CaseWithReference, APIEmbed]> {
    await prisma.guild.upsert({ create: { id: guild.id }, update: {}, where: { id: guild.id } });

    const cid = await getCaseId(guild.id);

    const infraction = await prisma.infraction.create({ 
        data: { 
            ...data,
            duration: data.duration ? Math.ceil(data.duration / Time.Second) : null,
            expiration: data.duration ? new Date(Date.now() + data.duration) : null,
            caseId: cid
        },
        include: {
            caseReference: true
        }
    });

    // If the infraction has a duration
    // Extend the length of the infraction if it already exists and update the data to match the new case
    // Else create a new job for it and then do it
    if(data.duration) {
        const key = `infraction-jid-${data.action === "VMute" ? "Deafen" : data.action}-${data.userId}`;

        // scoped by action so its only repeated infractions of same type updated
        let jobId = await redis.get(key);
        const job = jobId ? await Job.fromId(InfractionScheduledTaskManager.queue, jobId) : null;

        if(job)  {
            await job.changeDelay(data.duration);
            await job.updateData(infraction);
        }
        else jobId = (await InfractionScheduledTaskManager.schedule(infraction, { delay: data.duration })).id!;

        await redis.setex(key, Math.ceil(data.duration / Time.Second), jobId!);
    }
    const embed = await postModLogMessage(guild, { iconUrl: data.moderatorIconUrl, username: data.moderatorName, id: data.moderatorId }, infraction);

    if(dry) return [infraction, embed]; // Dry exits before executing moderation action

    try {
        if(dm && data.action !== "Unban") {
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId("void").setDisabled(true).setStyle(ButtonStyle.Primary).setLabel(`Sent from ${guild.name}`)
            );

            await guild.client.users.send(data.userId, { embeds: [embed], components: [row] });
        }
    } catch(error) {}

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
        } else if(data.action === "Deafen") {
            await guild.members.edit(data.userId, { mute: true, deaf: true });
        } else if(data.action === "VMute") {
            await guild.members.edit(data.userId, { mute: true });
        } else if(data.action === "Undeafen") {
            await guild.members.edit(data.userId, { mute: false, deaf: false });
        } else if(data.action === "VUnmute") {
            await guild.members.edit(data.userId, { mute: false });
        } else if(data.action !== "Warn") throw new InternalError("Unknown Infraction Type", `The infraction type ${data.action} does not execute any actions`);
    } catch(error) {
        if(error instanceof DiscordAPIError) return [infraction, createErrorEmbed(new InternalError(error.message))];
        
        Sentry.captureException(error);
        return [infraction, createErrorEmbed(error as Error)];
    }

    return [infraction, embed];
}