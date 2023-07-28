import { ClientEvents } from "discord.js";
import { Listener } from "../lib/framework/structures/Listener.js";
import { sendErrorResponse } from "../functions/sendErrorResponse.js";
import { createErrorEmbed } from "../functions/createErrorEmbed.js";
import { InternalError } from "../lib/framework/structures/errors/InternalError.js";

export default class CommandErrorListener implements Listener<"commandError"> {
    public readonly event = "commandError";
    public readonly once = false;

    public async run([interaction, error]: ClientEvents["commandError"]) {
        if(error instanceof InternalError) {
            interaction.client.logger.error(error);
        }

        await sendErrorResponse(interaction, createErrorEmbed(error));
    }
}