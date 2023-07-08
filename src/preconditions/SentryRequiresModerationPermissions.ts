import { Option } from "@sapphire/result";
import { PreconditionOption } from "../lib/framework/structures/Command.js";
import { Guild, GuildMember, PermissionFlagsBits, User } from "discord.js";
import stripIndent from "strip-indent";

// Adapted from https://github.com/discordjs/discord.js/blob/75d91b52b3ff1ea5ec82b94d1c9c127d9eac3e55/packages/discord.js/src/structures/GuildMember.js#L265
export function permissionsV1(member: GuildMember, target: GuildMember | User, guild: Guild): PreconditionOption {
    if (target.id === guild.ownerId)
        return Option.some({
            message: "Target is immune",
            context: "The target's permissions mean they are immune from punishment (target owns server)",
        });
    
    if (target.id === guild.client.user!.id)
        return Option.some({
            message: "Target is immune",
            context: "The target's permissions mean they are immune from punishment (target is Sentry)",
        });

    if (("bot" in target && target.bot) || ("user" in target && target.user.bot))
        return Option.some({
            message: "Target is immune",
            context: "The target's permissions mean they are immune from punishment (target is bot)",
        });

    if (!guild.members.me)
        return Option.some({ message: "Internal Error", context: "We cannot check Sentry's permissions - please report this on the GitHub" });
    
    if (
        !guild.members.me.permissions.has(
            [
                PermissionFlagsBits.BanMembers,
                PermissionFlagsBits.KickMembers,
                PermissionFlagsBits.ModerateMembers,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
            ],
            true
        )
    )
        return Option.some({
            message: "Sentry Missing Permissions",
            // eslint-disable-next-line max-len
            context: stripIndent(`Sentry requires the following permissions to execute moderation commands, and was missing at least one of them:
                                \`\`\`diff
                                + Ban Members
                                + Kick Members
                                + Moderate Members
                                + Send Messages
                                + Embed Links
                                \`\`\``),
        });

    if (!member.permissions.has([PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ModerateMembers], true))
        return Option.some({
            message: "Missing Permissions",
            context: "You require the following permissions to execute this command:\n```diff\n+ Ban Members\n+ Kick Members\n+ Moderate Members```",
        });

    if (target instanceof GuildMember) {
        if (target.permissions.has(PermissionFlagsBits.Administrator))
            return Option.some({
                message: "Target is immune",
                context: "The target's permissions mean they are immune from punishment (target has administrator permission)",
            });
        if (guild.members.me.roles.highest.comparePositionTo(target.roles.highest) <= 0)
            return Option.some({
                message: "Target is immune",
                context: "The target's permissions mean they are immune from punishment (target's highest role is higher or equal to mine)",
            });
        if (member.roles.highest.comparePositionTo(target.roles.highest) <= 0)
            return Option.some({
                message: "Target is immune",
                context: "The target's permissions mean they are immune from punishment (target's highest role is higher or equal to yours)",
            });
    }

    return Option.none;
}