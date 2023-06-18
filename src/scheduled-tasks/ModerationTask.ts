import { ApplyOptions } from "@sapphire/decorators";
import { ScheduledTask } from "@sapphire/plugin-scheduled-tasks";

export type CaseScheduledTaskPayload = {
  id: number;
};

@ApplyOptions<ScheduledTask.Options>({
  name: "expiringCase",
})
export class ModerationTask extends ScheduledTask {
  public async run(payload: CaseScheduledTaskPayload) {
    const modCase = await this.container.prisma.moderation.findUnique({ where: { caseId: payload.id } });
    if (!modCase) return;

    const guild = await this.container.client.guilds.fetch(modCase.guildId);

    switch (modCase.action) {
      case "Warn":
        await this.container.prisma.moderation.delete({ where: { caseId: payload.id } });
        break;
      case "Ban": {
        const caseResult = await this.container.utilities.moderation.createCase(guild, {
          reason: "Timed-ban expired",
          duration: null,
          guildId: guild.id,
          moderatorId: this.container.client.user!.id,
          action: "Unban",
          userId: modCase.userId,
          userName: modCase.userName,
          caseReferenceId: modCase.caseId,
        });

        caseResult.expect("case to not be err");
        break;
      }
      default:
        break;
    }
  }
}
