import { ApplicationCommandRegistry, Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { APIEmbed, ActionRowBuilder, ModalBuilder, PermissionFlagsBits, PermissionsBitField, TextInputBuilder, TextInputStyle } from "discord.js";
import { CaseAction } from "@prisma/client";

@ApplyOptions<Command.Options>({
  description: "Untimeout a user",
  requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ModerateMembers],
  requiredUserPermissions: [PermissionFlagsBits.ModerateMembers],
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class UntimeoutCommand extends Command {
  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(new PermissionsBitField([PermissionFlagsBits.ModerateMembers]).valueOf())
        .addUserOption((option) => option.setName("user").setDescription("The user to untimeout").setRequired(true))
        .addStringOption((option) =>
          option.setName("reason").setDescription("The reason for removing the timeout").setRequired(true).setMaxLength(500).setAutocomplete(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("reference")
            .setDescription("Add a case to reference this unban with")
            .setMinValue(1)
            .setRequired(false)
            .setAutocomplete(true)
        )
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
      action: "Untimeout",
      userId: user.id,
      userName: user.username,
      caseReferenceId: reference,
    });

    const [_caseData, embed] = modCase.expect("Expected case data");

    return interaction.reply({ embeds: [embed] });
  }

  public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction<"cached">) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const message = interaction.targetMessage;

    const caseNo = message.embeds[0]?.footer?.text.split("#")[1] ?? "-1";
    const modCase = await this.container.prisma.moderation.findUnique({ where: { caseId: parseInt(caseNo, 10) ?? -1 } });

    if (!modCase || modCase.action !== "Ban") {
      const embed: APIEmbed = {
        title: "No Case Log Found",
        description: `This command needs to be ran on a case log message produced by Sentry, referring to a ban`,
        color: 0xff595e,
      };

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId(`mod-${CaseAction.Unban}.${modCase.userId}-${modCase.userName}-${modCase.caseId}`)
      .setTitle("Create New Unban")
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

    return interaction.showModal(modal);
  }
}
