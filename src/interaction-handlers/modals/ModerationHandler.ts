import { CaseAction } from "@prisma/client";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ModalSubmitInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class ModalHandler extends InteractionHandler {
  public override parse(interaction: ModalSubmitInteraction) {
    const [action, details] = interaction.customId.split(".") as [string, string];
    if (!action.startsWith("mod-")) return this.none();

    const [id, name, reference] = details.split("-") as [string, string, string?];

    return this.some({ user: { name, id }, action: action.split("-")[1]! as CaseAction, reference });
  }

  public override async run(interaction: ModalSubmitInteraction<"cached">, parameters: InteractionHandler.ParseResult<this>) {
    const reference = parameters.reference ? parseInt(parameters.reference, 10) : null;

    const modCase = await this.container.utilities.moderation.createCase(interaction.guild, {
      reason: interaction.fields.getTextInputValue("reason"),
      guildId: interaction.guildId,
      duration: null,
      moderatorId: interaction.user.id,
      action: parameters.action,
      userId: parameters.user.id,
      userName: parameters.user.name,
      referenceId: reference,
    });

    const [_caseData, embed] = modCase.expect("Expected case data");

    return interaction.reply({ embeds: [embed] });
  }
}
