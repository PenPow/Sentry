import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { AutocompleteInteraction } from "discord.js";
import { clamp } from "../../functions/Clamp.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class AutocompleteHandler extends InteractionHandler {
  private readonly DEFAULT_REASONS = ["TOS Violation(s)", "NSFW", "Scam/Spam Account", "Harassment"];

  public override parse(interaction: AutocompleteInteraction) {
    if (!["warn", "timeout", "kick", "softban", "ban", "unban", "untimeout", "case", "vmute", "vdeafen"].includes(interaction.commandName))
      return this.none();

    const option = interaction.options.getFocused(true);

    if (option.name !== "reason") return this.none();

    return this.some({ query: option.value });
  }

  public override run(interaction: AutocompleteInteraction, { query }: InteractionHandler.ParseResult<this>) {
    return interaction.respond(
      query === ""
        ? this.DEFAULT_REASONS.map((reason) => ({
            name: reason,
            value: reason,
          }))
        : clamp(
            [
              { name: query, value: query },
              ...this.DEFAULT_REASONS.filter((reason) => reason.toLowerCase().startsWith(query.toLowerCase())).map((reason) => ({
                name: reason,
                value: reason,
              })),
            ],
            25
          )
    );
  }
}
