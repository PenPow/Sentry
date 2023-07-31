import { Option } from "@sapphire/result";
import { PreconditionOption } from "../lib/framework/structures/Command.js";
import { Guild, GuildMember, PermissionFlagsBits, User } from "discord.js";
import stripIndent from "strip-indent";
import { PreconditionValidationError } from "../lib/framework/structures/errors/PreconditionValidationError.js";
import { InternalError } from "../lib/framework/structures/errors/InternalError.js";

function isGuildMember(user: User | GuildMember): user is GuildMember {
    return "guild" in user;
}

// Adapted from https://github.com/discordjs/discord.js/blob/75d91b52b3ff1ea5ec82b94d1c9c127d9eac3e55/packages/discord.js/src/structures/GuildMember.js#L265
export function permissionsV1(member: GuildMember, target: GuildMember | User, guild: Guild): PreconditionOption {
    if(target.id === member.id) 
        // eslint-disable-next-line max-len
        return Option.some(new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target is self)"));
    
    if (target.id === guild.ownerId)
        // eslint-disable-next-line max-len
        return Option.some(new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target owns server)"));
    
    if (target.id === guild.client.user!.id)
        // eslint-disable-next-line max-len
        return Option.some(new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target is Sentry)"));

    if (("bot" in target && target.bot) || ("user" in target && target.user.bot))
        // eslint-disable-next-line max-len
        return Option.some(new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target is bot)"));

    if (!guild.members.me)
        return Option.some(new InternalError("Cannot check Sentry's permissions - please report this on github", "Sentry's user is not cached in the guild"));
    
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
        return Option.some(new PreconditionValidationError(
            "Sentry Missing Permissions",
            stripIndent(
                `Sentry requires the following permissions to execute moderation commands, and was missing at least one of them:
                \`\`\`diff
                + Ban Members
                + Kick Members
                + Moderate Members
                + Send Messages
                + Embed Links
                \`\`\``
            )
        ));

    if (!member.permissions.has([PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ModerateMembers], true))
        return Option.some(
            // eslint-disable-next-line max-len
            new PreconditionValidationError("Missing Permissions", "You require the following permissions to execute this command:\n```diff\n+ Ban Members\n+ Kick Members\n+ Moderate Members```")
        );

    if (isGuildMember(target)) {
        if (target.permissions.has(PermissionFlagsBits.Administrator))
            // eslint-disable-next-line max-len
            return Option.some(new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target has administrator permission)"));
        if (guild.members.me.roles.highest.comparePositionTo(target.roles.highest) <= 0)
            // eslint-disable-next-line max-len
            return Option.some(new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target's highest role is higher or equal to mine"));
        if (member.roles.highest.comparePositionTo(target.roles.highest) <= 0)
            // eslint-disable-next-line max-len
            return Option.some(new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target's highest role is higher or equal to yours)"));
    }

    return Option.none;
}