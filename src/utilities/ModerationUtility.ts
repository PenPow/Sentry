import { Moderation, CaseAction } from "@prisma/client";
import { Utility } from "@sapphire/plugin-utilities-store";
import { Result } from "@sapphire/result";
import { APIEmbed, ChannelType, Guild, Snowflake, TimestampStyles, User, hyperlink, messageLink, time } from "discord.js";
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

  public async createCase(guild: Guild, data: Case, dm = true): Promise<Result<[CaseWithReference, APIEmbed], Error>> {
    await this.container.prisma.guild.upsert({ create: { id: guild.id }, update: {}, where: { id: guild.id } });

    const modCase = await this.container.prisma.moderation.create({
      data: {
        ...data,
        caseId: await this.generateCaseId(guild.id),
      },
      include: {
        caseReference: true,
      },
    });

    if (data.duration) {
      await this.container.tasks.create("expiringCase", { id: modCase.caseId }, data.duration);
    }

    const moderator = await this.container.client.users.fetch(data.moderatorId);
    const embedResult = await this.sendModLogMessage(guild, moderator, modCase);

    const embed = embedResult.isOk() ? embedResult.unwrap() : embedResult.unwrapErr()[1];

    if (dm && data.action !== "Unban") {
      try {
        const user = await this.container.client.users.fetch(data.userId);

        const userEmbed = { ...embed, description: `You have recieved a punishment in \`${guild.name}\`\n\n${embed.description}` };

        await user.send({ embeds: [userEmbed] });
      } catch (_err) {}
    }

    try {
      switch (data.action) {
        case "Warn":
          break;
        case "Timeout":
          await guild.members.edit(data.userId, { communicationDisabledUntil: new Date(Date.now() + data.duration!), reason: data.reason });
          break;
        case "Kick":
          await guild.members.kick(data.userId, data.reason);
          break;
        case "Softban":
          await guild.members.ban(data.userId, { deleteMessageSeconds: (Time.Day * 7) / Time.Second, reason: data.reason });
          await guild.bans.remove(data.userId, "Removing ban as part of softban");
          break;
        case "Ban":
          await guild.members.ban(data.userId, { deleteMessageSeconds: (Time.Day * 7) / Time.Second, reason: data.reason });
          break;
        case "Unban":
          await guild.bans.remove(data.userId, "Removing ban as part of softban");
          break;
      }
    } catch (error) {
      this.container.logger.error(error);

      captureException(error);

      return Result.err(error as Error);
    }

    return Result.ok([modCase, embed]);
  }

  public async sendModLogMessage(guild: Guild, moderator: User, data: CaseWithReference): Promise<Result<APIEmbed, [Error, APIEmbed]>> {
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

      return Result.err([error as Error, embed]);
    }
  }

  public async getLogChannelForGuild(guild: Guild) {
    const channels = await guild.channels.fetch();
    const channel = channels.filter((channel) => channel?.type === ChannelType.GuildText).find((channel) => LogChannelNames.includes(channel!.name));

    if (!channel || !channel.isTextBased()) return null;

    return channel;
  }

  public generateCaseId(guildId: Snowflake): Promise<number> {
    return this.container.redis.incr(`p-id-${guildId}`);
  }

  private async createCaseDescription(guild: Guild, data: CaseWithReference): Promise<string> {
    let description = `**Member**: \`${data.userName}\` (${data.userId})\n**Action**: ${data.action}`;

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
        text: `Case #${data.caseId}`,
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
      case "Unban":
        return 0x8ac926;
      case "Ban":
        return 0xff595e;
      default:
        this.container.logger.fatal(`Punishment type ${type} has no configured colour`);
        return 0x000000;
    }
  }
}
