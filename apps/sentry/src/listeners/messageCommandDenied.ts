import { Events, Listener, type MessageCommandDeniedPayload, type UserError } from "@sapphire/framework";
import { PreconditionContextSchema } from "../functions/PreconditionFunctions.js";

export class MessageCommandDenied extends Listener<typeof Events.MessageCommandDenied> {
  public run(error: UserError, payload: MessageCommandDeniedPayload) {
    const ctx = PreconditionContextSchema.parse(Object(error.context ?? { err: "" }));
    if (Reflect.get(ctx, "silent")) return;

    return payload.message.reply({ embeds: [this.container.utilities.embeds.createErrorEmbed(error.message, ctx.err)] });
  }
}
