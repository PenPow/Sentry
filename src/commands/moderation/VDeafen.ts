import {
    ApplicationCommandOptionType, 
    AutocompleteInteraction,
    CacheType, 
    ChatInputCommandInteraction, 
    CommandInteraction, 
    PermissionsBitField, 
    RESTPostAPIApplicationCommandsJSONBody, 
} from "discord.js";
import { Command, PreconditionOption } from "../../lib/framework/structures/Command.js";
import { PermissionsValidator } from "../../utilities/Permissions.js";
import { permissionsV1 } from "../../preconditions/SentryRequiresModerationPermissions.js";
import { Option } from "@sapphire/result";
import { reasonAutocompleteHandler } from "../../handlers/Reason.js";
import { referenceAutocompleteHandler } from "../../handlers/Reference.js";
import { createTimedPunishment } from "../../functions/createTimedPunishment.js";

export default class VoiceDeafenCommand implements Command {
    public shouldRun(interaction: CommandInteraction<CacheType>): PreconditionOption {
        if(!interaction.inCachedGuild()) return Option.none;
        
        const { member, guild } = interaction;

        const target = interaction.isUserContextMenuCommand() 
            ? interaction.targetMember 
            : interaction.options.getMember("user") ?? interaction.options.getUser("user", true);
        
        return permissionsV1(member, target, guild);
    }

    public chatInputRun(interaction: ChatInputCommandInteraction<"cached">) {
        return createTimedPunishment(interaction, "VDeafen");
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
                name: 'vdeafen',
                description: 'Deafen a user in voice channels',
                dm_permission: false,
                default_member_permissions: PermissionsValidator.parse(new PermissionsBitField(PermissionsBitField.Flags.ModerateMembers).valueOf()),
                options: [
                    {
                        name: 'user',
                        description: 'The user to deafen',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: 'reason',
                        description: 'The reason to attach to this punishment',
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
                    },
                    {
                        name: 'expiration',
                        description: 'Undeafen the user automatically after a certain about of time (pass in a duration string)',
                        type: ApplicationCommandOptionType.String,
                    }
                ]
            }];
    }
}