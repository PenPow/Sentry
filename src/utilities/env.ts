import { InferType, s } from "@sapphire/shapeshift";
import { ILogObj, Logger } from "tslog";
import { inspect } from "util";

const schema = s.object({
    DISCORD_TOKEN: s.string.regex(/(?<mfaToken>mfa\.[a-z0-9_-]{20,})|(?<basicToken>[a-z0-9_-]{23,28}\.[a-z0-9_-]{6,7}\.[a-z0-9_-]{27})/i),
    DEVELOPMENT_GUILD_ID: s.string.regex(/^(?<id>\d{17,20})$/),
    PRISMA_ENCRYPTION_KEY: s.string.lengthEqual(57),

    SENTRY_DSN: s.string.url(),
    NODE_ENV: s.union(s.literal("PRODUCTION"), s.literal("DEVELOPMENT")),

    // NOTE: Injected at compile time
    // eslint-disable-next-line max-len
    NODE_VERSION: s.string.regex(/^([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)\.([0-9]|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/),
    GIT_COMMIT: s.string.lengthEqual(40)
});

export function loadEnv(logger?: Logger<ILogObj>): InferType<typeof schema> {
    try {
        return schema.parse(process.env);
    } catch (err) {
        logger?.fatal(inspect(err, { colors: true }));
        
        process.exit(1);
    }
}