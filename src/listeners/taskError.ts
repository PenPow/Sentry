import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { ScheduledTaskEvents } from "@sapphire/plugin-scheduled-tasks";
import * as Sentry from "@sentry/node";

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: ScheduledTaskEvents.ScheduledTaskError,
})
export class SharedListener extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
  public run(error: unknown, task: string, _payload: unknown) {
    if (!Reflect.has(this.container, "tasks")) return;

    return Sentry.captureException(error, { level: "error", tags: { event: this.name }, extra: { task } });
  }
}
