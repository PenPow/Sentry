import { 
    ActionRowBuilder,
    ApplicationCommandOptionType, 
    ApplicationCommandType, 
    AutocompleteInteraction,
    CacheType, 
    ChatInputCommandInteraction, 
    CommandInteraction, 
    ModalBuilder, 
    ModalSubmitInteraction, 
    PermissionsBitField, 
    RESTPostAPIApplicationCommandsJSONBody, 
    TextInputBuilder, 
    TextInputStyle, 
    UserContextMenuCommandInteraction
} from "discord.js";
import { Command, PreconditionOption } from "../../lib/framework/structures/Command.js";
import { PermissionsValidator } from "../../utilities/Permissions.js";
import { permissionsV1 } from "../../preconditions/SentryRequiresModerationPermissions.js";
import { Option } from "@sapphire/result";
import { PunishmentLock, createCase } from "../../utilities/Punishments.js";
import { reasonAutocompleteHandler } from "../../handlers/Reason.js";
import { referenceAutocompleteHandler } from "../../handlers/Reference.js";
import { createPunishment } from "../../functions/createPunishment.js";

export default class KickCommand implements Command {
    public shouldRun(interaction: CommandInteraction<CacheType>): PreconditionOption {
        if(!interaction.inCachedGuild()) return Option.some({ message: 'Not in guild', context: "You must be in a guild to run this command" });
        
        const { member, guild } = interaction;

        const target = interaction.isUserContextMenuCommand() 
            ? interaction.targetMember 
            : interaction.options.getMember("user") ?? interaction.options.getUser("user", true);
        
        return permissionsV1(member, target, guild);
    }

    public chatInputRun(interaction: ChatInputCommandInteraction<"cached">) {
        return createPunishment(interaction, "Kick");
    }

    public async userContextMenuRun(interaction: UserContextMenuCommandInteraction<"cached">) {
        const user = interaction.targetUser;

        const modal = new ModalBuilder()
            .setCustomId(`kick.${user.id}-${user.username}`)
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

    public async modalRun(interaction: ModalSubmitInteraction<"cached">) {
        const [userId, username] = interaction.customId.split('.')[1]!.split('-') as [string, string];

        await interaction.deferReply();

        await PunishmentLock.acquire(`punishment-${userId}`, async () => {
            const [, embed] = await createCase(interaction.guild, {
                guildId: interaction.guildId,
                reason: interaction.fields.getTextInputValue("reason"),
                duration: null,
                moderatorId: interaction.user.id,
                moderatorName: interaction.user.username,
                moderatorIconUrl: interaction.user.displayAvatarURL(),
                action: "Kick",
                userId,
                userName: username,
                referenceId: null
            }, { dm: true, dry: false });

            await interaction.editReply({ embeds: [embed ]});
        });
    }

    public async autocompleteRun(interaction: AutocompleteInteraction<"cached">) {
        const option = interaction.options.getFocused(true);

        if(option.name === "reason") {
            return interaction.respond(reasonAutocompleteHandler(option));
        } else if (option.name === "reference") {
            return interaction.respond(await referenceAutocompleteHandler(interaction.guildId, option));
        }
    }

    public toJSON(): RESTPostAPIApplicationCommandsJSONBody[] {
        return [
            {
                name: 'kick',
                description: 'Kick a user from your server.',
                dm_permission: false,
                default_member_permissions: PermissionsValidator.parse(new PermissionsBitField(PermissionsBitField.Flags.KickMembers).valueOf()),
                options: [
                    {
                        name: 'user',
                        description: 'The user to kick',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: 'reason',
                        description: 'The reason for adding this punishment',
                        type: ApplicationCommandOptionType.String,
                        max_length: 500,
                        autocomplete: true,
                        required: true,
                    },
                    {
                        name: 'dm',
                        description: 'Message the user with details of their punishment',
                        type: ApplicationCommandOptionType.Boolean,
                    },
                    {
                        name: 'reference',
                        description: 'Reference another case in this punishment',
                        type: ApplicationCommandOptionType.Integer,
                        min_value: 1,
                        autocomplete: true,
                    }
                ]
            }, 
            {
                name: 'Kick User',
                type: ApplicationCommandType.User,
                dm_permission: false,
                default_member_permissions: PermissionsValidator.parse(new PermissionsBitField(PermissionsBitField.Flags.KickMembers).valueOf()),
            }];
    }
}