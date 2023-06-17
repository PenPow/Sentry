import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-utilities-store/register";
import "dotenv/config";

import { LogLevel, SapphireClient, ApplicationCommandRegistries, RegisterBehavior } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import { getToken } from "./utilities/SecretsUtility.js";

const client = new SapphireClient({
  intents: [GatewayIntentBits.Guilds],
  disableMentionPrefix: false,
  shards: "auto",
  logger: {
    level: LogLevel.Debug,
  },
});

try {
  void client.login(await getToken());
} catch (e) {
  client.logger.error(e);
}

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

client.logger.info("Logged In");

/** Injected at build-time by docker */
export const version = process.env.GIT_COMMIT;
