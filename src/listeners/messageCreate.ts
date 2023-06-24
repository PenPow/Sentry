import { Events, Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import normalizeUrl from "normalize-url";

export class MessageCreateListener extends Listener<typeof Events.MessageCreate> {
  public async run(message: Message) {
    if (message.author.bot || message.author.system) return;
    if (!message.inGuild()) return;

    const matches = message.content.match(/(?:https?:\/\/)?\S{2,}\.\S{2,18}\/?\S*/gi);

    for (const match of matches ?? []) {
      const domain = new URL(
        normalizeUrl(match, {
          stripHash: true,
          stripAuthentication: true,
          normalizeProtocol: true,
          stripTextFragment: true,
          removeQueryParameters: true,
          removeTrailingSlash: true,
        })
      );

      if (this.container.utilities.security.check(domain.hostname)) {
        await this.container.utilities.moderation.createCase(
          message.guild,
          {
            reason: "Malicious Domain Detected",
            guildId: message.guild.id,
            duration: null,
            moderatorId: this.container.client.user!.id,
            action: "Ban",
            userId: message.author!.id,
            userName: message.author!.username,
            referenceId: null,
          },
          true
        );

        break; // Exit so we dont check the further domains - they are already banned
      }
    }
  }
}
