import { ApplyOptions } from "@sapphire/decorators";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { PermissionsBitField, PermissionFlagsBits, APIEmbed } from "discord.js";

@ApplyOptions<Subcommand.Options>({
  description: "Commands relating to moderation cases",
  subcommands: [
    {
      name: "lookup",
      chatInputRun: "chatInputLookupCase",
    },
    { name: "edit", chatInputRun: "chatInputEditCase" },
  ],
})
export class CaseCommand extends Subcommand {
  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(new PermissionsBitField([PermissionFlagsBits.ModerateMembers]).valueOf())
        .addSubcommand((command) =>
          command
            .setName("lookup")
            .setDescription("Grab the case details of an individual case")
            .addIntegerOption((option) =>
              option.setName("case").setDescription("The case number to lookup").setMinValue(1).setRequired(true).setAutocomplete(true)
            )
        )
        .addSubcommand((command) =>
          command
            .setName("edit")
            .setDescription("Modify a case's reason")
            .addIntegerOption((option) =>
              option.setName("case").setDescription("The case number to edit").setMinValue(1).setRequired(true).setAutocomplete(true)
            )
            .addStringOption((option) =>
              option.setName("reason").setDescription("The updated reason").setMaxLength(500).setRequired(true).setAutocomplete(true)
            )
        )
    );
  }

  public async chatInputLookupCase(interaction: Subcommand.ChatInputCommandInteraction<"cached">) {
    const caseNo = interaction.options.getInteger("case", true);

    const modCase = await this.container.prisma.moderation.findFirst({
      where: { caseId: caseNo, guildId: interaction.guildId },
      include: { caseReference: true },
    });

    if (!modCase) {
      const embed: APIEmbed = {
        title: "No Case Found",
        color: 0xea6e72,
      };

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const moderator = await interaction.client.users.fetch(modCase.moderatorId);

    const embed = await this.container.utilities.moderation.createCaseEmbed(interaction.guild, moderator, modCase);
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  public async chatInputEditCase(interaction: Subcommand.ChatInputCommandInteraction<"cached">) {
    const caseNo = interaction.options.getInteger("case", true);

    const modCase = await this.container.prisma.moderation.findFirst({
      where: { caseId: caseNo, guildId: interaction.guildId },
      include: { caseReference: true },
    });

    if (!modCase) {
      const embed: APIEmbed = {
        title: "No Case Found",
        color: 0xea6e72,
      };

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const reason = interaction.options.getString("reason", true);
    const newCase = await this.container.prisma.moderation.update({ where: { id: modCase.id }, data: { reason }, include: { caseReference: true } });

    const moderator = await interaction.client.users.fetch(modCase.moderatorId);

    const embedResult = await this.container.utilities.moderation.sendModLogMessage(interaction.guild, moderator, newCase);
    const embed = embedResult.isOk() ? embedResult.unwrap() : embedResult.unwrapErr()[1];

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
