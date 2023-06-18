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
        .addBooleanOption((option) =>
          option.setName("dm").setDescription("Message the user with details of their case (default true)").setRequired(false)
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
    const dm = interaction.options.getBoolean("dm", false) ?? false;
    let reference = interaction.options.getInteger("reference", false);

    const expiration = new Duration(interaction.options.getString("expiration", true));
    if (Number.isNaN(expiration.offset) || expiration.offset / Time.Day > 28) {
      throw new UserError({ identifier: "InvalidArguments", message: "Invalid Expiration" });
    }

    if (reference) {
      const referencedCase = await this.container.prisma.moderation.findFirst({ where: { caseId: reference, guildId: interaction.guildId } });

      if (referencedCase) reference = referencedCase.id;
      else reference = null;
    }

    const modCase = await this.container.utilities.moderation.createCase(
      interaction.guild,
      {
        reason,
        guildId: interaction.guildId,
        duration: expiration.offset,
        moderatorId: interaction.user.id,
        action: "Timeout",
        userId: user.id,
        userName: user.username,
        referenceId: reference,
      },
      dm
    );

    const [_caseData, embed] = modCase.expect("Expected case data");

    return interaction.reply({ embeds: [embed] });
  }
}
