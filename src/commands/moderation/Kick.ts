import { ApplicationCommandRegistry, Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ModalBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { CaseAction } from "@prisma/client";

@ApplyOptions<Command.Options>({
  description: "Kick a user from your server",
  requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.KickMembers],
  requiredUserPermissions: [PermissionFlagsBits.KickMembers],
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class KickCommand extends Command {
  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(new PermissionsBitField([PermissionFlagsBits.KickMembers]).valueOf())
        .addUserOption((option) => option.setName("user").setDescription("The user to kick").setRequired(true))
        .addStringOption((option) =>
          option.setName("reason").setDescription("The reason for adding the punishment").setRequired(true).setMaxLength(500).setAutocomplete(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("reference")
            .setDescription("Add a case to reference this punishment with")
            .setMinValue(1)
            .setRequired(false)
            .setAutocomplete(true)
        )
    );

    registry.registerContextMenuCommand((builder) =>
      builder
        .setName("Kick User")
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(new PermissionsBitField([PermissionFlagsBits.KickMembers]).valueOf())
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    let reference = interaction.options.getInteger("reference", false);

    if (reference) {
      const referencedCase = await this.container.prisma.moderation.findFirst({ where: { caseId: reference } });

      if (!referencedCase) reference = null;
    }

    const modCase = await this.container.utilities.moderation.createCase(interaction.guild, {
      reason,
      guildId: interaction.guildId,
      duration: null,
      moderatorId: interaction.user.id,
      action: "Kick",
      userId: user.id,
      userName: user.username,
      caseReferenceId: reference,
    });

    const caseData = modCase.expect("Expected case data");

    const moderator = await interaction.client.users.fetch(interaction.user.id);
    const logMessage = await this.container.utilities.moderation.sendModLogMessage(interaction.guild, moderator, caseData);

    const embed = logMessage.unwrap();

    return interaction.reply({ embeds: [embed] });
  }

  public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction<"cached">) {
    if (!interaction.isUserContextMenuCommand()) return;

    const user = interaction.targetUser;

    const modal = new ModalBuilder()
      .setCustomId(`mod-${CaseAction.Kick}.${user.id}-${user.username}`)
      .setTitle("Create New Kick")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Reason")
            .setMaxLength(500)
            .setPlaceholder("They ...")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        )
      );

    await interaction.showModal(modal);
  }
}
