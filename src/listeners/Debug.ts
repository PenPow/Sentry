import { ClientEvents } from "discord.js";
import { Listener } from "../lib/framework/structures/Listener.js";
import { client } from "../index.js";

export default class DebugListener implements Listener<"debug"> {
    public readonly event = "debug";
    public readonly once = false;

    public run([message]: ClientEvents["debug"]) {
        client.logger.debug(message);
    }
}