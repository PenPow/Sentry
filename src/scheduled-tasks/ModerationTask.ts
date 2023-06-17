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

    switch (modCase.action) {
      case "Warn":
        await this.container.prisma.moderation.delete({ where: { caseId: payload.id } });
        break;
      case "Timeout":
      default:
        break;
    }

    const guild = await this.container.client.guilds.fetch(modCase.guildId);

    const msg = await this.container.utilities.moderation.sendModLogMessage(guild, this.container.client.user!, {
      caseId: await this.container.utilities.moderation.generateCaseId(guild.id),
      createdAt: modCase.createdAt,
      duration: null,
      guildId: guild.id,
      moderatorId: this.container.client.user!.id,
      reason: "Punishment Duration Elapsed",
      modLogMessageId: null,
      action: "Punishment Expiry",
      userId: modCase.userId,
      userName: modCase.userName,
      caseReference: modCase,
      caseReferenceId: modCase.caseId,
    });

    msg.expect("Expected message to be sent");
  }
}
