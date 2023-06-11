import { Utility } from "@sapphire/plugin-utilities-store";
import { APIEmbed } from "discord.js";

export class EmbedsUtility extends Utility {
  public constructor(context: Utility.Context, options: Utility.Options) {
    super(context, {
      ...options,
      name: "embeds",
    });
  }

  public createErrorEmbed(message: string, context?: string): APIEmbed {
    const embed: APIEmbed = {
      title: "Precondition Failed",
      description: `**${message}**`,
      color: 0xff595e,
    };

    if (context) {
      embed.fields = [{ name: "Context", value: context }];
    }

    return embed;
  }
}
