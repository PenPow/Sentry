import { ApplyOptions } from "@sapphire/decorators";
import {
  Events,
  Listener,
  InteractionHandlerError as InteractionHandlerErrorContext,
  InteractionHandlerParseError as InteractionHandlerParseErrorContext,
} from "@sapphire/framework";
import * as Sentry from "@sentry/node";

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: Events.InteractionHandlerError,
})
export class InteractionHandlerError extends Listener<typeof Events.InteractionHandlerError> {
  public run(error: unknown, ctx: InteractionHandlerErrorContext) {
    Sentry.captureException(error, { level: "error", tags: { event: this.name }, extra: { handler: ctx.handler.name } });
  }
}

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: Events.InteractionHandlerParseError,
})
export class InteractionHandlerParseError extends Listener<typeof Events.InteractionHandlerParseError> {
  public run(error: unknown, ctx: InteractionHandlerParseErrorContext) {
    Sentry.captureException(error, { level: "error", tags: { event: this.name }, extra: { handler: ctx.handler.name } });
  }
}
