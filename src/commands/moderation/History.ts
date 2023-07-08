import { 
    APIEmbed,
    ApplicationCommandOptionType, 
    ApplicationCommandType, 
    CacheType, 
    ChatInputCommandInteraction, 
    CommandInteraction, 
    EmbedBuilder, 
    RESTPostAPIApplicationCommandsJSONBody, 
    Snowflake, 
    UserContextMenuCommandInteraction
} from "discord.js";
import { Command, PreconditionOption } from "../../lib/framework/structures/Command.js";
import { Option } from "@sapphire/result";
import { prisma } from "../../utilities/Prisma.js";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { clamp } from "../../utilities/Clamp.js";
import { createEmbed } from "../../utilities/Logging.js";

export default class HistoryCommand implements Command {
    public shouldRun(interaction: CommandInteraction<CacheType>): PreconditionOption {
        if(!interaction.inCachedGuild()) return Option.some({ message: 'Not in guild', context: "You must be in a guild to run this command" });
        
        return Option.none;
    }

    public chatInputRun(interaction: ChatInputCommandInteraction<"cached">) {
        const user = interaction.options.getUser("user", true);

        return this.sharedRun(interaction, user.id);
    }

    public async userContextMenuRun(interaction: UserContextMenuCommandInteraction<"cached">) {
        const user = interaction.targetUser;

        return this.sharedRun(interaction, user.id);
    }

    public toJSON(): RESTPostAPIApplicationCommandsJSONBody[] {
        return [
            {
                name: 'history',
                description: 'Get a user\'s moderation history',
                dm_permission: false,
                options: [
                    {
                        name: 'user',
                        description: 'The user to fetch the history of',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    }
                ]
            }, 
            {
                name: 'Get User History',
                type: ApplicationCommandType.User,
                dm_permission: false,
            }];
    }

    private async sharedRun(interaction: ChatInputCommandInteraction<"cached"> | UserContextMenuCommandInteraction<"cached">, userId: Snowflake) {
        const guild = await prisma.guild.findUnique({
            where: { id: interaction.guildId },
            include: { cases: { where: { userId }, include: { caseReference: true } } },
        });
      
        if (!guild) {
            const embed: APIEmbed = {
                title: "No Moderation History",
                color: 0x86b53a,
            };
      
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const message = new PaginatedMessage();

        for(const modCase of clamp(guild.cases, 24)) {
            const moderator = { username: modCase.moderatorName, id: modCase.moderatorId, displayAvatarURL: () => modCase.moderatorIconUrl };

            message.addPageEmbed(new EmbedBuilder(await createEmbed(interaction.guild, moderator, modCase )));
        }

        if (guild.cases.length >= 25) {
            message.addPageEmbed(
                new EmbedBuilder({
                    title: `And ${guild.cases.length - 25} more case${guild.cases.length - 25 === 1 ? "" : "s"}...`,
                    color: 0xea6e72,
                })
            );
        }

        await interaction.deferReply({ ephemeral: true }); // makes paginator ephemeral

        return message.run(interaction, interaction.user);
    }
}