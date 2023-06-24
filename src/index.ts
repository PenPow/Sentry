import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-utilities-store/register";
import "@sapphire/plugin-scheduled-tasks/register";
import "dotenv/config";

import { LogLevel, SapphireClient, ApplicationCommandRegistries, RegisterBehavior } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { getToken } from "./utilities/SecretsUtility.js";

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  disableMentionPrefix: false,
  shards: "auto",
  logger: {
    level: LogLevel.Debug,
  },
  tasks: {
    bull: {
      connection: {
        port: 6379,
        host: "redis",
        db: 0,
      },
    },
  },
});

try {
  void client.login(await getToken());
} catch (e) {
  client.logger.error(e);
}

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

/** Injected at build-time by docker */
export const version = process.env.GIT_COMMIT;
