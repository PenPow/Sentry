import { ApplicationCommandRegistry, Command, CommandOptionsRunTypeEnum, UserError } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { Duration, Time } from "@sapphire/time-utilities";

@ApplyOptions<Command.Options>({
  description: "Timeout a user",
  requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ModerateMembers],
  requiredUserPermissions: [PermissionFlagsBits.ModerateMembers],
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class TimeoutCommand extends Command {
  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(new PermissionsBitField([PermissionFlagsBits.ModerateMembers]).valueOf())
        .addUserOption((option) => option.setName("user").setDescription("The user to timeout").setRequired(true))
        .addStringOption((option) =>
          option.setName("reason").setDescription("The reason for adding the punishment").setRequired(true).setMaxLength(500).setAutocomplete(true)
        )
        .addStringOption((option) =>
          option
            .setName("expiration")
            .setDescription("How long should the timeout be for - up to a maximum of 28d (pass in a duration string)")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reference")
            .setDescription("Add a case to reference this punishment with")
            .setMinLength(6)
            .setMaxLength(6)
            .setRequired(false)
            .setAutocomplete(true)
        )
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    let reference = interaction.options.getString("reference", false);

    const expiration = new Duration(interaction.options.getString("expiration", true));
    if (Number.isNaN(expiration.offset) || expiration.offset / Time.Day > 28) {
      throw new UserError({ identifier: "InvalidArguments", message: "Invalid Expiration" });
    }

    if (reference) {
      const referencedCase = await this.container.prisma.moderation.findFirst({ where: { caseId: reference } });

      if (!referencedCase) reference = null;
    }

    const modCase = await this.container.utilities.moderation.createCase(interaction.guild, {
      reason,
      guildId: interaction.guildId,
      duration: expiration.offset,
      moderatorId: interaction.user.id,
      action: "Timeout",
      userId: user.id,
      userName: user.username,
      caseReferenceId: reference,
    });

    const caseData = modCase.expect("Expected case data");

    await this.container.tasks.create("expiringCase", { id: caseData.caseId }, expiration.offset);

    const moderator = await interaction.client.users.fetch(interaction.user.id);
    const logMessage = await this.container.utilities.moderation.sendModLogMessage(interaction.guild, moderator, caseData);

    const embed = logMessage.unwrap();

    return interaction.reply({ embeds: [embed] });
  }
}
