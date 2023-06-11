import { ApplyOptions } from "@sapphire/decorators";
import { AllFlowsPrecondition } from "@sapphire/framework";
import { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from "discord.js";

@ApplyOptions<AllFlowsPrecondition.Options>({
  name: "DeveloperOnly",
})
export class DeveloperOnlyPrecondition extends AllFlowsPrecondition {
  public override messageRun(message: Message) {
    return this.isDeveloper(message.author.id);
  }

  public override chatInputRun(interaction: CommandInteraction) {
    return this.isDeveloper(interaction.user.id);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.isDeveloper(interaction.user.id);
  }

  private isDeveloper(userId: Snowflake) {
    const isDev = userId === "207198455301537793";

    return isDev
      ? this.ok()
      : this.error({ message: "You cannot use this command!", context: { err: "This command is restricted to developers", silent: true } });
  }
}
