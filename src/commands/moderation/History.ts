import { ApplicationCommandRegistry, Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  APIEmbed,
  ApplicationCommandType,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { Moderation } from "@prisma/client";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { clamp } from "../../functions/Clamp.js";

@ApplyOptions<Command.Options>({
  description: "Fetch a user's moderation history",
  requiredClientPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks],
  requiredUserPermissions: [PermissionFlagsBits.ModerateMembers],
  runIn: [CommandOptionsRunTypeEnum.GuildText],
})
export class HistoryCommand extends Command {
  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(new PermissionsBitField([PermissionFlagsBits.ModerateMembers]).valueOf())
        .addUserOption((option) => option.setName("user").setDescription("The user to fetch the history of").setRequired(true))
    );

    registry.registerContextMenuCommand((builder) =>
      builder
        .setName("Fetch History")
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(new PermissionsBitField([PermissionFlagsBits.ModerateMembers]).valueOf())
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction<"cached">) {
    const user = interaction.options.getUser("user", true);

    const guild = await this.container.prisma.guild.findUnique({
      where: { id: interaction.guildId },
      include: { cases: { where: { userId: user.id }, include: { caseReference: true } } },
    });

    if (!guild) {
      const embed: APIEmbed = {
        title: "No Moderation History",
        color: 0x86b53a,
      };

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    return this.sharedRun(interaction, guild.cases);
  }

  public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction<"cached">) {
    if (!interaction.isUserContextMenuCommand()) return;

    const user = interaction.targetUser;

    const guild = await this.container.prisma.guild.findUnique({
      where: { id: interaction.guildId },
      include: { cases: { where: { userId: user.id }, include: { caseReference: true } } },
    });

    if (!guild) {
      const embed: APIEmbed = {
        title: "No Moderation History",
        color: 0x86b53a,
      };

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    return this.sharedRun(interaction, guild.cases);
  }

  private async sharedRun(
    interaction: Command.ChatInputCommandInteraction<"cached"> | UserContextMenuCommandInteraction<"cached">,
    cases: (Moderation & {
      caseReference: Moderation | null;
    })[]
  ): Promise<void> {
    const message = new PaginatedMessage();

    const { length } = cases;

    for (const modCase of clamp(cases, 24)) {
      message.addPageEmbed(
        new EmbedBuilder(
          await this.container.utilities.moderation.createCaseEmbed(
            interaction.guild,
            await interaction.client.users.fetch(modCase.moderatorId),
            modCase
          )
        )
      );
    }

    if (length >= 25) {
      message.addPageEmbed(
        new EmbedBuilder({
          title: `And ${length - 25} more case${length - 25 === 1 ? "" : "s"}...`,
          color: 0xea6e72,
        })
      );
    }

    await interaction.deferReply({ ephemeral: true }); // make ephemeral

    await message.run(interaction, interaction.user);
  }
}
