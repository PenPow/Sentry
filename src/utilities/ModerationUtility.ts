import { Moderation, CaseAction } from "@prisma/client";
import { Utility } from "@sapphire/plugin-utilities-store";
import { Result } from "@sapphire/result";
import { APIEmbed, ChannelType, Guild, TimestampStyles, User, hyperlink, messageLink, time } from "discord.js";
import { customAlphabet } from "nanoid/non-secure";
import { captureException } from "@sentry/node";
import { Time } from "@sapphire/time-utilities";

export type Case = Omit<Moderation, "createdAt" | "caseId" | "modLogMessageId">;
export type CaseWithReference = Omit<Moderation, "action"> & { action: CaseAction | "Punishment Expiry"; caseReference: Moderation | null };

export const LogChannelNames = ["modlogs", "modlog", "mod-log", "mod-logs", "logs", "sentry-logs", "sentry-log"];

export class ModerationUtility extends Utility {
  public constructor(context: Utility.Context, options: Utility.Options) {
    super(context, {
      ...options,
      name: "moderation",
    });
  }

  public async createCase(guild: Guild, data: Case): Promise<Result<CaseWithReference, Error>> {
    const user = await guild.members.fetch(data.userId);

    try {
      switch (data.action) {
        case "Warn":
          break;
        case "Timeout":
          await user.timeout(data.duration, data.reason);
          break;
        case "Kick":
          await user.kick(data.reason);
          break;
        case "Softban":
          await user.ban({ deleteMessageSeconds: (Time.Day * 7) / Time.Millisecond, reason: data.reason });
          await guild.bans.remove(user, "Removing ban as part of softban");
      }
    } catch (error) {
      this.container.logger.error(error);

      captureException(error);

      return Result.err(error as Error);
    }

    await this.container.prisma.guild.upsert({ create: { id: guild.id }, update: {}, where: { id: guild.id } });

    const modCase = await this.container.prisma.moderation.create({
      data: {
        ...data,
        caseId: this.generateCaseId(),
      },
      include: {
        caseReference: true,
      },
    });

    return Result.ok(modCase);
  }

  public async sendModLogMessage(guild: Guild, moderator: User, data: CaseWithReference): Promise<Result<APIEmbed, Error>> {
    const channel = await this.getLogChannelForGuild(guild);
    const embed = await this.createCaseEmbed(guild, moderator, data);

    if (!channel) return Result.ok(embed);

    if (data.modLogMessageId) {
      const message = await channel.messages.fetch(data.modLogMessageId);

      if (message) {
        await message.edit({ embeds: [embed] });

        return Result.ok(embed);
      }
    }

    try {
      const message = await channel.send({ embeds: [embed] });

      if (data.action !== "Punishment Expiry")
        await this.container.prisma.moderation.update({ where: { caseId: data.caseId }, data: { modLogMessageId: message.id } });

      return Result.ok(embed);
    } catch (error) {
      this.container.logger.error(error);

      captureException(error);

      return Result.err(error as Error);
    }
  }

  public async getLogChannelForGuild(guild: Guild) {
    const channels = await guild.channels.fetch();
    const channel = channels.filter((channel) => channel?.type === ChannelType.GuildText).find((channel) => LogChannelNames.includes(channel!.name));

    if (!channel || !channel.isTextBased()) return null;

    return channel;
  }

  public generateCaseId(): string {
    return customAlphabet("1234567890", 9)();
  }

  private async createCaseDescription(guild: Guild, data: CaseWithReference): Promise<string> {
    let description = `**Member**: \`${data.userName}\` ({${data.userId})\n**Action**: ${data.action}`;

    if (data.duration) {
      description += `\n**Expiration**: ${time(new Date(Date.now() + data.duration), TimestampStyles.RelativeTime)}`;
    }

    description += `\n**Reason**: ${data.reason}`;

    if (data.caseReference) {
      const channel = await this.getLogChannelForGuild(guild);

      if (data.caseReference.modLogMessageId && channel) {
        description += `\n**Case Reference**: ${hyperlink(
          `#${data.caseReference.caseId}`,
          messageLink(channel.id, data.caseReference.modLogMessageId)
        )}`;
      } else {
        description += `\n**Case Reference**: \`#${data.caseReference.caseId}\``;
      }
    }

    return description;
  }

  private async createCaseEmbed(guild: Guild, moderator: User, data: CaseWithReference): Promise<APIEmbed> {
    return {
      color: this.getEmbedColour(data.action),
      author: {
        // FIXME: Will be replaced by the new discord global name system once released, furthermore need to look into how it works for bots
        name: `${moderator.tag} (${moderator.id})`,
        icon_url: moderator.displayAvatarURL(),
      },
      timestamp: new Date(data.createdAt).toISOString(),
      description: await this.createCaseDescription(guild, data),
      footer: {
        text: `Case Reference #${data.caseId}`,
      },
    };
  }

  private getEmbedColour(type: CaseAction | "Punishment Expiry"): number {
    switch (type) {
      case "Warn":
      case "Timeout":
        return 0xffca3a;
      case "Kick":
      case "Softban":
        return 0xffa05e;
      case "Punishment Expiry":
        return 0x1e1e21;
      default:
        this.container.logger.fatal(`Punishment type ${type} has no configured colour`);
        return 0x000000;
    }
  }
}
