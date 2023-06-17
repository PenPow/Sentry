import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { AutocompleteInteraction } from "discord.js";
import { clamp } from "../../functions/Clamp.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class AutocompleteHandler extends InteractionHandler {
  public override parse(interaction: AutocompleteInteraction) {
    if (!interaction.inCachedGuild()) return this.none();

    if (!["warn", "timeout"].includes(interaction.commandName)) return this.none();

    const option = interaction.options.getFocused(true);
    if (option.name !== "reference") return this.none();

    return this.some({ query: option.value });
  }

  public override async run(interaction: AutocompleteInteraction<"cached">, { query }: InteractionHandler.ParseResult<this>) {
    const cases = (await this.container.prisma.guild.findUnique({ where: { id: interaction.guildId }, include: { cases: true } }))?.cases ?? [];

    return interaction.respond(
      cases.length === 0
        ? [{ name: "No Cases Found", value: "null" }]
        : clamp(
            cases.filter((modCase) => modCase.caseId.startsWith(query)).map((modCase) => ({ name: `${modCase.caseId}`, value: modCase.caseId })),
            25
          )
    );
  }
}
