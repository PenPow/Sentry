import { AuditLogChange, AuditLogEvent, ClientEvents, Guild, GuildAuditLogsEntry } from "discord.js";
import { Listener } from "../lib/framework/structures/Listener.js";
import { createCase } from "../utilities/Infractions.js";

export default class GuildAuditLogEntryCreateListener implements Listener<"guildAuditLogEntryCreate"> {
    public readonly event = "guildAuditLogEntryCreate";
    public readonly once = false;

    public async run([entry, guild]: ClientEvents["guildAuditLogEntryCreate"]) {
        if(entry.action === AuditLogEvent.MemberUpdate) {
            const timeoutChange = entry.changes.find((change) => change.key === "communication_disabled_until");

            if(timeoutChange !== undefined) {
                if(timeoutChange.new === undefined) await this.handleUntimeout(entry as GuildAuditLogsEntry<AuditLogEvent.MemberUpdate>, guild);
                else await this.handleTimeout(entry as GuildAuditLogsEntry<AuditLogEvent.MemberUpdate>, timeoutChange, guild);
            }

            const muteChange = entry.changes.find((change) => change.key === "mute");
            const deafChange = entry.changes.find((change) => change.key === "deaf");
            if(deafChange) {
                if(deafChange.new === true) await this.handleDeafen(entry as GuildAuditLogsEntry<AuditLogEvent.MemberUpdate>,  guild);
            } else if (muteChange) {
                if(muteChange.new === true) await this.handleVMute(entry as GuildAuditLogsEntry<AuditLogEvent.MemberUpdate>, guild);
            }
        }
    }

    private async handleTimeout(entry: GuildAuditLogsEntry<AuditLogEvent.MemberUpdate>, change: AuditLogChange, guild: Guild) {
        const moderator = entry.executor ?? await guild.client.users.fetch(entry.executorId!);
        if(!moderator || moderator.bot) return;

        const user = entry.target ?? await guild.client.users.fetch(entry.targetId!);
        if(!user) return;
        
        await createCase(guild, {
            guildId: guild.id,
            duration: new Date(change.new as string).getTime() - Date.now(),
            moderatorId: moderator.id,
            moderatorName: moderator.username,
            moderatorIconUrl: moderator.displayAvatarURL(),
            reason: `${entry.reason ?? 'No Reason Specified'} (Manual Infraction)`,
            action: 'Timeout',
            userId: user.id,
            userName: user.username
        }, { dm: false, dry: true });
    }

    private async handleUntimeout(entry: GuildAuditLogsEntry<AuditLogEvent.MemberUpdate>, guild: Guild) {
        const moderator = entry.executor ?? await guild.client.users.fetch(entry.executorId!);
        if(!moderator || moderator.bot) return;

        const user = entry.target ?? await guild.client.users.fetch(entry.targetId!);
        if(!user) return;
        
        await createCase(guild, {
            guildId: guild.id,
            duration: null,
            moderatorId: moderator.id,
            moderatorName: moderator.username,
            moderatorIconUrl: moderator.displayAvatarURL(),
            reason: `${entry.reason ?? 'No Reason Specified'} (Manual Infraction)`,
            action: 'Untimeout',
            userId: user.id,
            userName: user.username
        }, { dm: false, dry: true });
    }

    private async handleVMute(entry: GuildAuditLogsEntry<AuditLogEvent.MemberUpdate>, guild: Guild) {
        const moderator = entry.executor ?? await guild.client.users.fetch(entry.executorId!);
        if(!moderator || moderator.bot) return;

        const user = entry.target ?? await guild.client.users.fetch(entry.targetId!);
        if(!user) return;
        
        await createCase(guild, {
            guildId: guild.id,
            duration: null,
            moderatorId: moderator.id,
            moderatorName: moderator.username,
            moderatorIconUrl: moderator.displayAvatarURL(),
            reason: `${entry.reason ?? 'No Reason Specified'} (Manual Infraction)`,
            action: 'VMute',
            userId: user.id,
            userName: user.username
        }, { dm: false, dry: true });
    }

    private async handleDeafen(entry: GuildAuditLogsEntry<AuditLogEvent.MemberUpdate>, guild: Guild) {
        const moderator = entry.executor ?? await guild.client.users.fetch(entry.executorId!);
        if(!moderator || moderator.bot) return;

        const user = entry.target ?? await guild.client.users.fetch(entry.targetId!);
        if(!user) return;
        
        await createCase(guild, {
            guildId: guild.id,
            duration: null,
            moderatorId: moderator.id,
            moderatorName: moderator.username,
            moderatorIconUrl: moderator.displayAvatarURL(),
            reason: `${entry.reason ?? 'No Reason Specified'} (Manual Infraction)`,
            action: 'Deafen',
            userId: user.id,
            userName: user.username
        }, { dm: false, dry: true });
    }
}