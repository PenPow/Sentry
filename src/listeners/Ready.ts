import { ClientEvents } from "discord.js";
import { Listener } from "../lib/framework/structures/Listener.js";

export default class ReadyListener implements Listener<"ready"> {
    public readonly event = "ready";
    public readonly once = true;

    public run([client]: ClientEvents["ready"]) {
        client.logger.info("Sentry is online");
    }
}