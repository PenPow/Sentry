import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import {
  AutoModerationActionType,
  AutoModerationRuleEventType,
  AutoModerationRuleTriggerType,
  ChannelType,
  Guild,
  GuildFeature,
  NewsChannel,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

@ApplyOptions<Listener.Options>({})
export class GuildCreateListener extends Listener<typeof Events.GuildCreate> {
  public async run(guild: Guild) {
    if (!guild.features.includes(GuildFeature.AutoModeration)) return;
    if (!guild.members.me?.permissions.has([PermissionFlagsBits.ManageGuild], true)) return;

    const logChannel = await this.container.utilities.moderation.getLogChannelForGuild(guild);
    if (
      !logChannel ||
      [ChannelType.GuildStageVoice, ChannelType.GuildVoice].includes(logChannel.type) ||
      !logChannel.permissionsFor(guild.members.me, true).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])
    )
      return; // TODO: Setup log channel on join

    const rules = await guild.autoModerationRules.fetch();
    const sentryRule = rules.find((rule) => rule.name === "Sentry Automod Integration");

    const rule = {
      name: "Sentry Automod Integration",
      eventType: AutoModerationRuleEventType.MessageSend,
      triggerType: AutoModerationRuleTriggerType.Keyword,
      triggerMetadata: { regexPatterns: ["(?:https?://)?\\S{2,}\\.\\S{2,18}/?\\S*"] },
      actions: [{ type: AutoModerationActionType.SendAlertMessage, metadata: { channel: logChannel as TextChannel | NewsChannel } }],
      enabled: true,
      exemptChannels: [logChannel],
      reason: "Sentry Automod Setup",
    };

    if (sentryRule && !sentryRule.enabled) {
      await guild.autoModerationRules.edit(sentryRule, rule);
    } else if (!sentryRule) {
      await guild.autoModerationRules.create(rule);
    }
  }
}
