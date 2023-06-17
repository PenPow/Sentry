import { CaseAction } from "@prisma/client";
import { ApplyOptions } from "@sapphire/decorators";
import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";

export type CaseScheduledTaskPayload = {
  action: CaseAction;
  id: string;
};

@ApplyOptions<ScheduledTask.Options>({
  name: "expiringCase",
})
export class ModerationTask extends ScheduledTask {
  public async run(payload: CaseScheduledTaskPayload) {
    switch (payload.action) {
      case "Warn":
        await this.container.prisma.moderation.delete({ where: { caseId: payload.id } });
        break;
    }
  }
}
