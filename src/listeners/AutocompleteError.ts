import { ClientEvents } from "discord.js";
import { Listener } from "../lib/framework/structures/Listener.js";
import * as Sentry from "@sentry/node";

export default class AutocompleteErrorListener implements Listener<"autocompleteError"> {
    public readonly event = "autocompleteError";
    public readonly once = false;

    public run([interaction, error]: ClientEvents["autocompleteError"]) {
        Sentry.captureException(error);
        interaction.client.logger.error(error);
    }
}