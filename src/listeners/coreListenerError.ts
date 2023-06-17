import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerErrorPayload } from "@sapphire/framework";
import * as Sentry from "@sentry/node";

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: Events.ListenerError,
})
export class CoreListenerError extends Listener<typeof Events.ListenerError> {
  public run(error: unknown, ctx: ListenerErrorPayload) {
    Sentry.captureException(error, { level: "error", tags: { name: ctx.piece.name } });
  }
}
