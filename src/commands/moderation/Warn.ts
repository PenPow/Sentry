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
import { Duration } from "@sapphire/time-utilities";
import { CaseAction } from "@prisma/client";

@ApplyOptions<Command.Options>({
  description: "Warn a user",
  requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
  requiredUserPermissions: [PermissionFlagsBits.ModerateMembers],
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class WarnCommand extends Command {
  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(new PermissionsBitField([PermissionFlagsBits.ModerateMembers]).valueOf())
        .addUserOption((option) => option.setName("user").setDescription("The user to add the warn to").setRequired(true))
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
        .addStringOption((option) =>
          option
            .setName("expiration")
            .setDescription("Remove the warning after a given amount of time (pass in a duration string)")
            .setRequired(false)
        )
    );

    registry.registerContextMenuCommand((builder) =>
      builder
        .setName("Warn User")
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(new PermissionsBitField([PermissionFlagsBits.ModerateMembers]).valueOf())
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    let reference = interaction.options.getInteger("reference", false);

    const expirationOption = interaction.options.getString("expiration", false);
    const expiration = expirationOption ? new Duration(expirationOption) : null;

    if (reference) {
      const referencedCase = await this.container.prisma.moderation.findFirst({ where: { caseId: reference } });

      if (!referencedCase) reference = null;
    }

    const modCase = await this.container.utilities.moderation.createCase(interaction.guild, {
      reason,
      guildId: interaction.guildId,
      duration: Number.isNaN(expiration?.offset) ? null : expiration ? expiration.offset : null,
      moderatorId: interaction.user.id,
      action: "Warn",
      userId: user.id,
      userName: user.username,
      caseReferenceId: reference,
    });

    const caseData = modCase.expect("Expected case data");

    if (expiration instanceof Duration && !Number.isNaN(expiration.offset)) {
      await this.container.tasks.create("expiringCase", { id: caseData.caseId }, expiration.offset);
    }

    const moderator = await interaction.client.users.fetch(interaction.user.id);
    const logMessage = await this.container.utilities.moderation.sendModLogMessage(interaction.guild, moderator, caseData);

    const embed = logMessage.unwrap();

    return interaction.reply({ embeds: [embed] });
  }

  public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction<"cached">) {
    if (!interaction.isUserContextMenuCommand()) return;

    const user = interaction.targetUser;

    const modal = new ModalBuilder()
      .setCustomId(`mod-${CaseAction.Warn}.${user.id}-${user.username}`)
      .setTitle("Create New Warning")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Warning Reason")
            .setMaxLength(500)
            .setPlaceholder("They ...")
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        )
      );

    await interaction.showModal(modal);
  }
}
