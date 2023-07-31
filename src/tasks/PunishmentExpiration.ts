import { ScheduledTaskManager } from "../lib/framework/structures/ScheduledTasks.js";
import { CaseWithReference } from "../types/Punishment.js";
import { prisma } from "../utilities/Prisma.js";
import { createCase } from "../utilities/Punishments.js";

class PunishmentTaskManager extends ScheduledTaskManager<CaseWithReference, "punishment-expiration"> {
    protected override async run(payload: CaseWithReference): Promise<void> {
        const guild = await client.guilds.fetch(payload.guildId);

        if(payload.action === "Warn") {
            await prisma.punishment.delete({ where: { id: payload.id } });
        } else if(payload.action === "Ban") {
            await createCase(guild, {
                reason: "Timed-ban expired",
                duration: null,
                guildId: guild.id,
                moderatorId: client.user!.id,
                moderatorName: client.user!.username,
                moderatorIconUrl: client.user!.displayAvatarURL(),
                action: "Unban",
                userId: payload.userId,
                userName: payload.userName,
                referenceId: payload.caseId,
            }, { dm: false, dry: false });
        } else if(payload.action === "VDeafen" || payload.action === "VMute") {
            await guild.members.edit(payload.userId, { mute: false, deaf: false });
        } else if(payload.action === "Timeout") {
            await createCase(guild, {
                reason: "Timeout expired",
                duration: null,
                guildId: guild.id,
                moderatorId: client.user!.id,
                moderatorName: client.user!.username,
                moderatorIconUrl: client.user!.displayAvatarURL(),
                action: "Untimeout",
                userId: payload.userId,
                userName: payload.userName,
                referenceId: payload.caseId,
            }, { dm: false, dry: false });
        }
    }
}

export const PunishmentScheduledTaskManager = new PunishmentTaskManager("punishment-expiration");