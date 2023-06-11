import { type ContextMenuCommandDeniedPayload, Events, Listener, type UserError } from "@sapphire/framework";
import { PreconditionContextSchema } from "../functions/PreconditionFunctions.js";

export class ContextMenuCommandDenied extends Listener<typeof Events.ContextMenuCommandDenied> {
  public run(error: UserError, payload: ContextMenuCommandDeniedPayload) {
    const ctx = PreconditionContextSchema.parse(Object(error.context ?? { err: "" }));
    if (ctx.silent) return;

    const embed = this.container.utilities.embeds.createErrorEmbed(error.message, ctx.err);

    if (payload.interaction.deferred || payload.interaction.replied) {
      return payload.interaction.editReply({
        embeds: [embed],
      });
    }

    return payload.interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
