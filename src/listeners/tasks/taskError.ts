import { Listener } from "@sapphire/framework";
import { ScheduledTaskEvents } from "@sapphire/plugin-scheduled-tasks";
import { captureException } from "@sentry/node";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: ScheduledTaskEvents.ScheduledTaskError,
})
export class TaskErrorListener extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
  public run(error: unknown, task: string, _payload: unknown) {
    return captureException(error, { level: "error", tags: { event: this.name }, extra: { task } });
  }
}
