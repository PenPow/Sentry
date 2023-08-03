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
import { createInfraction } from "../../functions/createInfraction.js";
import { PreconditionValidationError } from "../../lib/framework/structures/errors/PreconditionValidationError.js";

export default class UntimeoutCommand implements Command {
    public shouldRun(interaction: CommandInteraction<CacheType>): PreconditionOption {
        if(!interaction.inCachedGuild()) return Option.some(new PreconditionValidationError('Not in guild', "You must be in a guild to run this command"));
        
        const { member, guild } = interaction;

        const target = interaction.isUserContextMenuCommand() 
            ? interaction.targetMember 
            : interaction.options.getMember("user") ?? interaction.options.getUser("user", true);
        
        return permissionsV1(member, target, guild);
    }

    public chatInputRun(interaction: ChatInputCommandInteraction<"cached">) {
        return createInfraction(interaction, "Untimeout");
    }

    public async autocompleteRun(interaction: AutocompleteInteraction<"cached">) {
        const option = interaction.options.getFocused(true);

        if(option.name === "reason") {
            return interaction.respond(reasonAutocompleteHandler(option, "Removal"));
        } else if (option.name === "reference") {
            return interaction.respond(await referenceAutocompleteHandler(interaction.guildId, option));
        }
    }

    public toJSON(): RESTPostAPIApplicationCommandsJSONBody[] {
        return [
            {
                name: 'untimeout',
                description: 'Remove a timeout from a user',
                dm_permission: false,
                default_member_permissions: PermissionsValidator.parse(new PermissionsBitField(PermissionsBitField.Flags.ModerateMembers).valueOf()),
                options: [
                    {
                        name: 'user',
                        description: 'The user to untimeout',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: 'reason',
                        description: 'The reason to attach to this moderator action',
                        type: ApplicationCommandOptionType.String,
                        max_length: 500,
                        autocomplete: true,
                        required: true,
                    },
                    {
                        name: 'reference',
                        description: 'Reference another case in this mod action',
                        type: ApplicationCommandOptionType.Integer,
                        min_value: 1,
                        autocomplete: true,
                    }
                ]
            }];
    }
}