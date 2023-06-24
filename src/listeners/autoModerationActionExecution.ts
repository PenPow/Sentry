import { Events, Listener } from "@sapphire/framework";
import { AutoModerationActionExecution } from "discord.js";
import normalizeUrl from "normalize-url";

export class AutoModerationActionExecutionEvent extends Listener<typeof Events.AutoModerationActionExecution> {
  public async run(event: AutoModerationActionExecution) {
    const { content, guild, user } = event;

    // thanks discord
    // you created an automod system that allows regexes
    // you didnt add functionality to your system however to execute the same regex multiple times, and so it executes once per message
    // this opens up the potential exploit of sending a benign domain initially, and then the malicious one
    // using your built in matched_content allows this
    // therefore, we are now using cpu time to parse out ALL domains myself
    // with a separate regex because you use rust regex
    // to perform the simple matching functionality that should be already implemented
    const matches = content.match(/(?:https?:\/\/)?\S{2,}\.\S{2,18}\/?\S*/gi);

    for (const match of matches ?? []) {
      const domain = new URL(normalizeUrl(match, { stripHash: true, stripAuthentication: true, normalizeProtocol: true, stripTextFragment: true }));

      if (this.container.utilities.phishing.check(domain.hostname)) {
        await this.container.utilities.moderation.createCase(
          event.guild,
          {
            reason: "Malicious Domain Detected",
            guildId: guild.id,
            duration: null,
            moderatorId: this.container.client.user!.id,
            action: "Ban",
            userId: user!.id,
            userName: user!.username,
            referenceId: null,
          },
          true
        );

        break; // Exit so we dont check the further domains - they are already banned
      }
    }
  }
}
