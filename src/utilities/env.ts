import { s } from "@sapphire/shapeshift";
import { ILogObj, Logger } from "tslog";
import { inspect } from "util";

const schema = s.object({
    DISCORD_TOKEN: s.string.regex(/(?<mfaToken>mfa\.[a-z0-9_-]{20,})|(?<basicToken>[a-z0-9_-]{23,28}\.[a-z0-9_-]{6,7}\.[a-z0-9_-]{27})/i),
    DEVELOPMENT_GUILD_ID: s.string.regex(/^(?<id>\d{17,20})$/)
});

export function loadEnv(logger: Logger<ILogObj>) {
    try {
        return schema.parse(process.env);
    } catch (err) {
        logger.fatal(inspect(err, { colors: true }));
        
        process.exit(1);
    }
}