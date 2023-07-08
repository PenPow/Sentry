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
import { Command, PreconditionOption } from "../lib/framework/structures/Command.js";
import { PermissionsValidator } from "../utilities/Permissions.js";
import { permissionsV1 } from "../preconditions/SentryRequiresModerationPermissions.js";
import { Option } from "@sapphire/result";
import { prisma } from "../utilities/Prisma.js";
import { PunishmentLock, createCase } from "../utilities/Punishments.js";
import { Duration } from "@sapphire/time-utilities";
import { reasonAutocompleteHandler } from "../handlers/Reason.js";
import { referenceAutocompleteHandler } from "../handlers/Reference.js";

export default class HelloWorldCommand implements Command {
    public shouldRun(interaction: CommandInteraction<CacheType>): PreconditionOption {
        if(!interaction.inCachedGuild()) return Option.none;
        
        const { member, guild } = interaction;

        const target = interaction.isUserContextMenuCommand() 
            ? interaction.targetMember 
            : interaction.options.getMember("user") ?? interaction.options.getUser("user", true);
        
        return permissionsV1(member, target, guild);
    }

    public async chatInputRun(interaction: ChatInputCommandInteraction<"cached">) {
        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason", true);
        const dm = interaction.options.getBoolean("dm", false) ?? true;

        let reference = interaction.options.getInteger("reference", false);
        if(reference) {
            const caseReference = await prisma.punishment.findUnique({ where: { guildId_caseId: { caseId: reference, guildId: interaction.guildId } }});

            if(caseReference) reference = caseReference.id;
        }

        const expirationOption = interaction.options.getString("expiration", false);
        const expiration = expirationOption ? new Duration(expirationOption) : null;

        await interaction.deferReply();

        await PunishmentLock.acquire(`punishment-${user.id}`, async () => {
            const [, embed] = await createCase(interaction.guild, {
                guildId: interaction.guildId,
                reason,
                duration: Number.isNaN(expiration?.offset) ? null : expiration ? expiration.offset : null, // HACK: god there must be a nicer way to write this
                moderatorId: interaction.user.id,
                action: "Ban",
                userId: user.id,
                userName: user.username,
                referenceId: reference
            }, { dm, dry: false });

            await interaction.editReply({ embeds: [embed ]});
        });
    }

    public async userContextMenuRun(interaction: UserContextMenuCommandInteraction<"cached">) {
        const user = interaction.targetUser;

        const modal = new ModalBuilder()
            .setCustomId(`ban.${user.id}-${user.username}`)
            .setTitle("Create New Ban")
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
                action: "Ban",
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

    public toJSON(): RESTPostAPIApplicationCommandsJSONBody[] { // TODO: Add Context Menu Command
        return [
            {
                name: 'ban',
                description: 'Ban a user from your server.',
                dm_permission: false,
                default_member_permissions: PermissionsValidator.parse(new PermissionsBitField(PermissionsBitField.Flags.BanMembers).valueOf()),
                options: [
                    {
                        name: 'user',
                        description: 'The user to ban',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: 'reason',
                        description: 'The reason for adding this punishment',
                        type: ApplicationCommandOptionType.String,
                        max_length: 500,
                        autocomplete: true,
                    },
                    {
                        name: 'dm',
                        description: 'Message the user with details of their punishments',
                        type: ApplicationCommandOptionType.Boolean,
                    },
                    {
                        name: 'reference',
                        description: 'Reference another case in this punishment',
                        type: ApplicationCommandOptionType.Integer,
                        min_value: 1,
                        autocomplete: true,
                    },
                    {
                        name: 'expiration',
                        description: 'Unban the user automatically after a certain about of time (pass in a duration string)',
                        type: ApplicationCommandOptionType.String,
                    }
                ]
            }, 
            {
                name: 'Ban User',
                type: ApplicationCommandType.User,
                dm_permission: false,
                default_member_permissions: PermissionsValidator.parse(new PermissionsBitField(PermissionsBitField.Flags.BanMembers).valueOf()),
            }];
    }
}