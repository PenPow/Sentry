import { Events, Listener } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { AutoModerationActionExecution, AutoModerationRuleTriggerType } from "discord.js";

export class AutoModerationActionExecutionEvent extends Listener<typeof Events.AutoModerationActionExecution> {
  public async run(event: AutoModerationActionExecution) {
    const { guild, user } = event;

    if (event.ruleTriggerType === AutoModerationRuleTriggerType.Spam) {
      const modCase = await this.container.utilities.moderation.createCase(
        guild,
        {
          reason: "Spam",
          guildId: guild.id,
          duration: Time.Hour * 3,
          moderatorId: this.container.client.user!.id,
          action: "Timeout",
          userId: user!.id,
          userName: user!.username,
          referenceId: null,
        },
        true
      );

      modCase.unwrap();
    } else if (event.ruleTriggerType === AutoModerationRuleTriggerType.MentionSpam) {
      const modCase = await this.container.utilities.moderation.createCase(
        guild,
        {
          reason: "Mention Spam",
          guildId: guild.id,
          duration: Time.Hour * 6,
          moderatorId: this.container.client.user!.id,
          action: "Timeout",
          userId: user!.id,
          userName: user!.username,
          referenceId: null,
        },
        true
      );

      modCase.unwrap();
    }
  }
}
