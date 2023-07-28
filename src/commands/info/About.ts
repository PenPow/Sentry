import { 
    APIEmbed,
    ChatInputCommandInteraction, 
    RESTPostAPIApplicationCommandsJSONBody, 
} from "discord.js";
import { Command } from "../../lib/framework/structures/Command.js";

export default class AboutCommand implements Command {
    public chatInputRun(interaction: ChatInputCommandInteraction<"cached">) {
        const embed: APIEmbed = {
            title: '<:sentry:942693843269218334> About Sentry',
            // eslint-disable-next-line max-len
            description: "Sentry is a Discord moderation bot designed to make moderation simple again. We integrate with native moderation features to stay out of your way to let you focus on moderating",
            fields: [{
                name: 'Debug Information',
                value: [
                    // eslint-disable-next-line max-len
                    `\n<:dot:1127218627905585282> Sentry Release **[${interaction.client.environment.GIT_COMMIT.slice(0, 7)}](https://github.com/PenPow/Sentry/commit/${interaction.client.environment.GIT_COMMIT})**`,
                    `Running on Node v${interaction.client.environment.NODE_VERSION}`
                ].join('\n\n <:dot:1127218627905585282>')
            }],
            color: 0x1e1e21
        };

        return interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    public toJSON(): RESTPostAPIApplicationCommandsJSONBody[] {
        return [
            {
                name: 'about',
                description: 'Learn more about Sentry',
            }];
    }
}