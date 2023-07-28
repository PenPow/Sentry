import { APIEmbed } from "discord.js";
import { InternalError } from "../lib/framework/structures/errors/InternalError.js";
import { PreconditionValidationError } from "../lib/framework/structures/errors/PreconditionValidationError.js";
import { UserError } from "../lib/framework/structures/errors/UserError.js";
import { client } from "../index.js";

export function createErrorEmbed(error: Error): APIEmbed {
    if(error instanceof InternalError || error instanceof UserError || error instanceof PreconditionValidationError) {
        const embed: APIEmbed = {
            title: error.message,
            description: error.context ?? '',
            footer: {
                text: error.name,
            },
            color: 0xff595f,
        };

        return embed;
    }

    const embed: APIEmbed = {
        title: "An Unknown Error Occurred",
        description: `Please report this on our [GitHub](https://github.com/PenPow/Sentry), posting all relevent details.\n\n\`\`\`js\n${error.stack}\n\`\`\``,
        footer: {
            text: error.name,
        },
        color: 0xff595f,
    };

    client.logger.error(error);

    return embed;
}