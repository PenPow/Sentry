import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import * as Sentry from "@sentry/node";

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: Events.Error,
})
export class CoreError extends Listener<typeof Events.Error> {
  public run(error: unknown) {
    Sentry.captureException(error, { level: "error", tags: { event: this.name } });
  }
}
