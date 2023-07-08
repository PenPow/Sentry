import { Time } from "@sapphire/time-utilities";
import { APIEmbed, ChannelType, Guild, TimestampStyles, User, hyperlink, messageLink, time } from "discord.js";
import { CaseWithReference } from "../types/Punishment.js";
import { prettifyCaseActionName, convertActionToColor } from "./Punishments.js";
import { prisma } from "./Prisma.js";

async function getGuildLogChannel(guild: Guild) {
    const channels = await guild.channels.fetch();
    const channel = channels.filter((channel) => channel?.type === ChannelType.GuildText).find((channel) => 
        ["modlogs", "modlog", "mod-log", "mod-logs", "logs", "sentry-logs", "sentry-log"].includes(channel!.name)
    );

    if (!channel || !channel.isTextBased()) return null;

    return channel;
}

async function createEmbed(guild: Guild, moderator: User, data: CaseWithReference): Promise<APIEmbed> {
    let description = `**Member**: \`${data.userName}\` (${data.userId})\n**Action**: ${prettifyCaseActionName(data.action)}`;

    if (data.duration) {
        description += `\n**Expiration**: ${time(new Date(Date.now() + data.duration * Time.Second), TimestampStyles.RelativeTime)}`;
    }

    description += `\n**Reason**: ${data.reason}`;

    if (data.caseReference) {
        const channel = await getGuildLogChannel(guild);
  
        if (data.caseReference.modLogMessageId && channel) {
            description += `\n**Case Reference**: ${hyperlink(
                `#${data.caseReference.caseId}`,
                messageLink(channel.id, data.caseReference.modLogMessageId)
            )}`;
        } else {
            description += `\n**Case Reference**: \`#${data.caseReference.caseId}\``;
        }
    }
    
    return {
        color: convertActionToColor(data.action),
        author: {
            name: `${moderator.username} (${moderator.id})`, // FIXME: Replace with Pomelo once released
            icon_url: moderator.displayAvatarURL(),
        },
        timestamp: new Date(data.createdAt).toISOString(),
        description,
        footer: {
            text: `Case #${data.caseId}`,
        },
    };
}

export async function postModLogMessage(guild: Guild, moderator: User, data: CaseWithReference): Promise<APIEmbed> {
    const embed = createEmbed(guild, moderator, data);

    const channel = await getGuildLogChannel(guild);
    if(!channel) return embed; // Early return so the embed can be used in the interaction reply

    if (data.modLogMessageId) {
        const message = await channel.messages.fetch(data.modLogMessageId);
  
        if (message) {
            await message.edit({ embeds: [await embed] });
  
            return embed;
        }
    }

    try {
        const message = await channel.send({ embeds: [await embed] });
  
        await prisma.punishment.update({ where: { id: data.id }, data: { modLogMessageId: message.id } });
  
        return embed;
    } catch (error) { // TODO: Add sentry integration
        return embed;
    }
}