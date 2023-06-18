import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { AutocompleteInteraction } from "discord.js";
import { clamp } from "../../functions/Clamp.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class AutocompleteHandler extends InteractionHandler {
  public override parse(interaction: AutocompleteInteraction) {
    if (!["warn", "timeout", "kick", "softban", "ban", "unban", "untimeout"].includes(interaction.commandName)) return this.none();

    const option = interaction.options.getFocused(true);

    if (option.name !== "reason") return this.none();

    return this.some({ query: option.value });
  }

  // TODO: Implement default reasons
  // Stub function to just return the user's input
  public override run(interaction: AutocompleteInteraction, { query }: InteractionHandler.ParseResult<this>) {
    return interaction.respond(query === "" ? [] : clamp([{ name: query, value: query }], 25));
  }
}
