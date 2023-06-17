import { ApplicationCommandRegistry, Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { PermissionFlagsBits, PermissionsBitField } from "discord.js";

@ApplyOptions<Command.Options>({
  description: "Softban a user from your server",
  requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.BanMembers],
  requiredUserPermissions: [PermissionFlagsBits.BanMembers],
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class SoftbanCommand extends Command {
  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(new PermissionsBitField([PermissionFlagsBits.BanMembers]).valueOf())
        .addUserOption((option) => option.setName("user").setDescription("The user to softban").setRequired(true))
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
      action: "Softban",
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
}