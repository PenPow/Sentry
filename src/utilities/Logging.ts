import { Time } from "@sapphire/time-utilities";
import { APIEmbed, APIEmbedAuthor, ChannelType, Guild, TextChannel, TimestampStyles, hyperlink, messageLink, time } from "discord.js";
import { CaseWithReference, UserLike } from "../types/Infraction.js";
import { prettifyCaseActionName, convertActionToColor } from "./Infractions.js";
import { prisma } from "./Prisma.js";
import * as Sentry from "@sentry/node";

export async function getGuildLogChannel(guild: Guild): Promise<TextChannel | null>  {
    const channels = await guild.channels.fetch();
    const channel = channels.filter((channel) => channel?.type === ChannelType.GuildText && channel.isTextBased()).find((channel) => 
        ["modlogs", "modlog", "mod-log", "mod-logs", "logs", "sentry-logs", "sentry-log"].includes(channel!.name)
    );

    if (!channel) return null;

    return channel as TextChannel;
}

export async function createEmbed(guild: Guild, moderator: UserLike, data: CaseWithReference): Promise<APIEmbed> {
    let description = `**Member**: \`${data.userName}\` (${data.userId})\n**Action**: ${prettifyCaseActionName(data.action)}`;

    if (data.duration) {
        const date = new Date((data.createdAt ? data.createdAt.getTime() : Date.now()) + data.duration * Time.Second);
        description += `\n**Expiration**: ${time(date, TimestampStyles.RelativeTime)}`;
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

    if (data.frozen) {
        description += '\n\n**Flags**\n🧊 Frozen';
    }

    const author = {
        name: `${moderator.username} (${moderator.id})`, // FIXME: Replace with Pomelo once released
    } as APIEmbedAuthor;

    if(moderator.iconUrl) author.icon_url = moderator.iconUrl;
    
    return {
        color: convertActionToColor(data.action),
        author,
        timestamp: new Date(data.createdAt).toISOString(),
        description,
        footer: {
            text: `Case #${data.caseId}`,
        },
    };
}

export async function postModLogMessage(guild: Guild, moderator: UserLike, data: CaseWithReference): Promise<APIEmbed> {
    const embed = await createEmbed(guild, moderator, data);

    const channel = await getGuildLogChannel(guild);
    if(!channel) return embed; // Early return so the embed can be used in the interaction reply

    if (data.modLogMessageId) {
        const message = await channel.messages.fetch(data.modLogMessageId);
  
        if (message) {
            await message.edit({ embeds: [embed] });
  
            return embed;
        }
    }

    try {
        const message = await channel.send({ embeds: [embed] });
  
        await prisma.infraction.update({ where: { id: data.id }, data: { modLogMessageId: message.id } });
  
        return embed;
    } catch (error) {
        Sentry.captureException(error);

        return embed;
    }
}