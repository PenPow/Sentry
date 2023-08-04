import { 
    APIEmbed,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    ChannelType,
    ChatInputCommandInteraction, 
    PermissionsBitField, 
    RESTPostAPIApplicationCommandsJSONBody, 
} from "discord.js";
import { Command } from "../../lib/framework/structures/Command.js";
import { Duration, Time } from "@sapphire/time-utilities";
import { createErrorEmbed } from "../../functions/createErrorEmbed.js";
import { UserError } from "../../lib/framework/structures/errors/UserError.js";
import { PermissionsValidator } from "../../utilities/Permissions.js";
import { reasonAutocompleteHandler } from "../../handlers/Reason.js";

export default class AboutCommand implements Command {
    public async chatInputRun(interaction: ChatInputCommandInteraction<"cached">) {
        const option = interaction.options.getString("value", true);
        const duration = new Duration(option);

        const channel = interaction.options.getChannel("channel", false, [
            ChannelType.GuildText,
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
            ChannelType.GuildVoice,
            ChannelType.GuildForum,
            ChannelType.GuildStageVoice,
            ChannelType.GuildAnnouncement
        ]) ?? interaction.channel!;

        if(Number.isNaN(duration.offset) || duration.offset < 0 || duration.fromNow.getTime() >= new Date(Date.now() + (6 * Time.Hour)).getTime()) {
            return interaction.reply({ 
                embeds: [createErrorEmbed(new UserError("Invalid Slowmode", "The slowmode must be within the range 0s-6h"))],
                ephemeral: true 
            });
        }

        const durationInSeconds = duration.offset / Time.Second;
        const reason = interaction.options.getString('reason', false) ?? 'No Reason Provided';

        await channel.setRateLimitPerUser(durationInSeconds, reason);

        if(channel.type === ChannelType.GuildForum) {
            await channel.setDefaultThreadRateLimitPerUser(durationInSeconds, reason);
        }

        const embed: APIEmbed = {
            title: `Set Slowmode to ${option}`,
            color: 0x5865f2
        };

        return interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    public async autocompleteRun(interaction: AutocompleteInteraction<"cached">) {
        const option = interaction.options.getFocused(true);

        if(option.name === "reason") {
            return interaction.respond(reasonAutocompleteHandler(option, "Removal"));
        }
    }

    public toJSON(): RESTPostAPIApplicationCommandsJSONBody[] {
        return [
            {
                name: 'slowmode',
                description: 'Set the slowmode for a channel',
                dm_permission: false,
                default_member_permissions: PermissionsValidator.parse(new PermissionsBitField(PermissionsBitField.Flags.ModerateMembers).valueOf()),
                options: [
                    {
                        name: 'value',
                        description: 'The slowmode for the channel (pass a duration string)',
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                    {
                        name: 'channel',
                        description: 'Optionally the channel to set the slowmode in',
                        type: ApplicationCommandOptionType.Channel,
                        channel_types: [
                            ChannelType.GuildText,
                            ChannelType.PublicThread,
                            ChannelType.PrivateThread,
                            ChannelType.GuildVoice,
                            ChannelType.GuildForum,
                            ChannelType.GuildStageVoice,
                            ChannelType.GuildAnnouncement
                        ],
                        required: false
                    },
                    {
                        name: 'reason',
                        description: 'The reason for setting this slowmode',
                        type: ApplicationCommandOptionType.String,
                        max_length: 500,
                        required: false,
                        autocomplete: true
                    }
                ]
            }];
    }
}