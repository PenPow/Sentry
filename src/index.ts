import { GatewayIntentBits } from "discord.js";
import { SentryClient } from "./lib/framework/structures/SentryClient.js";
import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";

export const client = new SentryClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration]
});

Sentry.init({
    dsn: client.environment.SENTRY_DSN,
    release: client.environment.GIT_COMMIT,
    enabled: client.environment.NODE_ENV === "production",
    environment: client.environment.NODE_ENV,
    integrations: [
        new Sentry.Integrations.Undici(),
        new RewriteFrames({ root: "/usr/sentry/dist", prefix: "src/" }),
    ]
});

Sentry.setTags({ 
    version: client.environment.GIT_COMMIT, 
    started_at: new Date(Date.now()).toUTCString(), 
    node_version: client.environment.NODE_VERSION 
});

void client.login(client.environment.DISCORD_TOKEN);