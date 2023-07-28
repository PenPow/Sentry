import { GatewayIntentBits } from "discord.js";
import { SentryClient } from "./lib/framework/structures/SentryClient.js";

export const client = new SentryClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration]
});

void client.login(client.environment.DISCORD_TOKEN);