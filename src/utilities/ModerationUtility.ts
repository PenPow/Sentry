import { Moderation, CaseAction } from "@prisma/client";
import { Utility } from "@sapphire/plugin-utilities-store";
import { Result } from "@sapphire/result";
import { APIEmbed, ChannelType, Guild, TimestampStyles, User, hyperlink, messageLink, time } from "discord.js";
import { nanoid } from "nanoid/non-secure";
import { captureException } from "@sentry/node";

export type Case = Omit<Moderation, "createdAt" | "caseId" | "modLogMessageId">;
export type CaseWithReference = Moderation & { caseReference: Moderation | null };

export const LogChannelNames = ["modlogs", "modlog", "mod-log", "mod-logs", "logs", "sentry-logs", "sentry-log"];

export class ModerationUtility extends Utility {
  public constructor(context: Utility.Context, options: Utility.Options) {
    super(context, {
      ...options,
      name: "moderation",
    });
  }

  public async createCase(_guild: Guild, data: Case): Promise<Result<CaseWithReference, Error>> {
    try {
      switch (data.action) {
        case "Warn":
          break;
      }
    } catch (error) {
      this.container.logger.error(error);

      captureException(error);

      return Result.err(error as Error);
    }

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

  public async sendModLogMessage(guild: Guild, moderator: User, data: CaseWithReference): Promise<Result<unknown, Error>> {
    const channel = await this.getLogChannelForGuild(guild);

    if (!channel) return Result.ok();

    const embed = await this.createCaseEmbed(guild, moderator, data);

    if (data.modLogMessageId) {
      const message = await channel.messages.fetch(data.modLogMessageId);

      if (message) {
        await message.edit({ embeds: [embed] });

        return Result.ok();
      }
    }

    try {
      const message = await channel.send({ embeds: [embed] });

      await this.container.prisma.moderation.update({ where: { caseId: data.caseId }, data: { modLogMessageId: message.id } });

      return Result.ok();
    } catch (error) {
      this.container.logger.error(error);

      captureException(error);

      return Result.err(error as Error);
    }
  }

  private async getLogChannelForGuild(guild: Guild) {
    const channels = await guild.channels.fetch();
    const channel = channels.filter((channel) => channel?.type === ChannelType.GuildText).find((channel) => LogChannelNames.includes(channel!.name));

    if (!channel || !channel.isTextBased()) return null;

    return channel;
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

  private getEmbedColour(type: CaseAction): number {
    switch (type) {
      case "Warn":
        return 0xebd070;
    }
  }

  private generateCaseId(): string {
    return nanoid(14);
  }
}
