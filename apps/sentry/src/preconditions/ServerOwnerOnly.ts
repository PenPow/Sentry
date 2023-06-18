import { ApplyOptions } from "@sapphire/decorators";
import { AllFlowsPrecondition } from "@sapphire/framework";
import { APIInteractionGuildMember, CommandInteraction, ContextMenuCommandInteraction, Guild, GuildMember, Message } from "discord.js";

@ApplyOptions<AllFlowsPrecondition.Options>({
  name: "ServerOwnerOnly",
})
export class ServerOwnerOnlyPrecondition extends AllFlowsPrecondition {
  public override messageRun(message: Message) {
    if (!message.inGuild() || !message.member)
      return this.error({ message: "Not in guild", context: "This command requires you to be the server owner of a guild" });

    return this.isServerOwner(message.member, message.guild);
  }

  public override chatInputRun(interaction: CommandInteraction) {
    if (!interaction.inCachedGuild()) return this.error({ message: "Not in guild", context: "You need to be the Server Owner" });

    return this.isServerOwner(interaction.member, interaction.guild);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    if (!interaction.inCachedGuild()) return this.error({ message: "Not in guild", context: "You need to be the Server Owner" });

    return this.isServerOwner(interaction.member, interaction.guild);
  }

  private isServerOwner(member: GuildMember | APIInteractionGuildMember, guild: Guild) {
    const isOwner = guild.ownerId === member.user.id;

    return isOwner
      ? this.ok()
      : this.error({
          message: "You cannot use this command!",
          context: { err: "You need to be the Server Owner" },
        });
  }
}
