import { ApplyOptions } from "@sapphire/decorators";
import { AllFlowsPrecondition } from "@sapphire/framework";
import { CommandInteraction, ContextMenuCommandInteraction, GuildMember, Message, Guild, User, PermissionFlagsBits } from "discord.js";

@ApplyOptions<AllFlowsPrecondition.Options>({
  name: "ClientNeedsModerationPrivileges",
})
export class ClientNeedsModerationPrivilegesPrecondition extends AllFlowsPrecondition {
  public override messageRun(message: Message) {
    if (!message.inGuild() || !message.member)
      return this.error({ message: "Not in guild", context: { err: "This command requires you to be in a guild" } });

    return this.error({ message: "Unsupported", context: { err: "Message commands are unsupported" } });
  }

  public override chatInputRun(interaction: CommandInteraction) {
    if (!interaction.inCachedGuild())
      return this.error({ message: "Not in guild", context: { err: "You need to be in a guild to run this command" } });

    const target = interaction.options.getMember("user") ?? interaction.options.getUser("user", true);

    return this.canExecuteModerationAction(interaction.member, target, interaction.guild);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    if (!interaction.inCachedGuild())
      return this.error({ message: "Not in guild", context: { err: "You need to be in a guild to run this command" } });
    if (!interaction.isUserContextMenuCommand())
      return this.error({ message: "No User Found", context: { err: "No user found to check permissions against" } });

    const target = interaction.targetMember;

    return this.canExecuteModerationAction(interaction.member, target, interaction.guild);
  }

  // Adapted from https://github.com/discordjs/discord.js/blob/75d91b52b3ff1ea5ec82b94d1c9c127d9eac3e55/packages/discord.js/src/structures/GuildMember.js#L265
  private canExecuteModerationAction(member: GuildMember, target: GuildMember | User, guild: Guild) {
    if (target.id === guild.ownerId)
      return this.error({
        message: "Target is immune",
        context: { err: "The target's permissions mean they are immune from punishment (target owns server)" },
      });
    if (target.id === this.container.client.user!.id)
      return this.error({
        message: "Target is immune",
        context: { err: "The target's permissions mean they are immune from punishment (target is Sentry)" },
      });
    if (("bot" in target && target.bot) || ("user" in target && target.user.bot))
      return this.error({
        message: "Target is immune",
        context: { err: "The target's permissions mean they are immune from punishment (target is bot)" },
      });

    if (!guild.members.me)
      return this.error({ message: "Internal Error", context: { err: "We cannot check Sentry's permissions - please report this on the GitHub" } });
    if (
      !guild.members.me.permissions.has(
        [
          PermissionFlagsBits.BanMembers,
          PermissionFlagsBits.KickMembers,
          PermissionFlagsBits.ModerateMembers,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.EmbedLinks,
        ],
        true
      )
    )
      return this.error({
        message: "Sentry Missing Permissions",
        context: {
          err:
            // eslint-disable-next-line max-len
            "Sentry requires the following permissions to execute moderation commands, and was missing at least one of them:\n```diff\n+ Ban Members\n+ Kick Members\n+ Moderate Members\n+ Send Messages\n+ Embed Links\n```",
        },
      });

    if (!member.permissions.has([PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.ModerateMembers], true))
      return this.error({
        message: "Missing Permissions",
        context: {
          err: "You require the following permissions to execute this command:\n```diff\n+ Ban Members\n+ Kick Members\n+ Moderate Members```",
        },
      });

    if (target instanceof GuildMember) {
      if (target.permissions.has(PermissionFlagsBits.Administrator))
        return this.error({
          message: "Target is immune",
          context: { err: "The target's permissions mean they are immune from punishment (target has administrator permission)" },
        });
      if (guild.members.me.roles.highest.comparePositionTo(target.roles.highest) <= 0)
        return this.error({
          message: "Target is immune",
          context: { err: "The target's permissions mean they are immune from punishment (target's highest role is higher or equal to mine)" },
        });
      if (member.roles.highest.comparePositionTo(target.roles.highest) <= 0)
        return this.error({
          message: "Target is immune",
          context: { err: "The target's permissions mean they are immune from punishment (target's highest role is higher or equal to yours)" },
        });
    }

    return this.ok();
  }
}
