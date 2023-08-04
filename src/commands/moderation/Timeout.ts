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
import { createTimedInfraction } from "../../functions/createTimedInfraction.js";
import { PreconditionValidationError } from "../../lib/framework/structures/errors/PreconditionValidationError.js";
import { durationAutocompleteHandler } from "../../handlers/Duration.js";
import { Duration } from "@sapphire/time-utilities";

export default class TimeoutCommand implements Command {
    public shouldRun(interaction: CommandInteraction<CacheType>): PreconditionOption {
        if(!interaction.inCachedGuild()) return Option.some(new PreconditionValidationError('Not in guild', "You must be in a guild to run this command"));
        
        const { member, guild } = interaction;

        const target = interaction.isUserContextMenuCommand() 
            ? interaction.targetMember 
            : interaction.options.getMember("user") ?? interaction.options.getUser("user", true);
        
        return permissionsV1(member, target, guild);
    }

    public chatInputRun(interaction: ChatInputCommandInteraction<"cached">) {
        return createTimedInfraction(interaction, "Timeout");
    }

    public async autocompleteRun(interaction: AutocompleteInteraction<"cached">) {
        const option = interaction.options.getFocused(true);

        if(option.name === "reason") {
            return interaction.respond(reasonAutocompleteHandler(option));
        } else if (option.name === "reference") {
            return interaction.respond(await referenceAutocompleteHandler(interaction.guildId, option));
        } else if (option.name === "expiration") {
            return interaction.respond(durationAutocompleteHandler(option, new Duration('27d23h59m59s')));
        }
    }

    public toJSON(): RESTPostAPIApplicationCommandsJSONBody[] {
        return [
            {
                name: 'timeout',
                description: 'Timeout a user in your server',
                dm_permission: false,
                default_member_permissions: PermissionsValidator.parse(new PermissionsBitField(PermissionsBitField.Flags.ModerateMembers).valueOf()),
                options: [
                    {
                        name: 'user',
                        description: 'The user to timeout',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: 'reason',
                        description: 'The reason for adding this infraction',
                        type: ApplicationCommandOptionType.String,
                        max_length: 500,
                        autocomplete: true,
                        required: true,
                    },
                    {
                        name: 'expiration',
                        description: 'How long the timeout should last, up to 28 days (pass in a duration string)',
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        autocomplete: true

                    },
                    {
                        name: 'dm',
                        description: 'Message the user with details of their infraction',
                        type: ApplicationCommandOptionType.Boolean,
                    },
                    {
                        name: 'reference',
                        description: 'Reference another case in this infraction',
                        type: ApplicationCommandOptionType.Integer,
                        min_value: 1,
                        autocomplete: true,
                    }
                ]
            }];
    }
}