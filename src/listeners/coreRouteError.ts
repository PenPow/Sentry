import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { ServerEvents } from "@sapphire/plugin-api";
import * as Sentry from "@sentry/node";

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: ServerEvents.Error,
})
export class SharedListener extends Listener<typeof ServerEvents.Error> {
  public run(error: unknown) {
    if (!Reflect.has(this.container, "server")) return;
    Sentry.captureException(error, { level: "error", tags: { event: this.name } });
  }
}
