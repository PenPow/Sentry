import { describe, vi, test, expect, beforeAll } from "vitest";
import { Schema, loadEnv } from "../src/utilities/env.js";
import { BaseError } from "@sapphire/shapeshift";

vi.stubGlobal("vitest", true);

const stubEnvironment = <T extends Record<string, string>>(env: T) => {
    for(const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
};

const stubValidEnvironment = () => {
    const environmentVariables: Schema = {
        "DEVELOPMENT_GUILD_ID": "1".repeat(18),
        "DISCORD_TOKEN": "AAAAAAAAAAAAAAAAAAAAAAAA.AAAAAA.AAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "GIT_COMMIT": "A".repeat(40),
        "NODE_ENV": "production",
        "NODE_VERSION": "16.16.0",
        "PRISMA_ENCRYPTION_KEY": "A".repeat(57),
        "SENTRY_DSN": "https://www.example.com"
    };

    stubEnvironment(environmentVariables);

    return environmentVariables;
};

const stubInvalidEnvironment = () => {
    const environmentVariables: Schema = {
        "DEVELOPMENT_GUILD_ID": "invalid",
        "DISCORD_TOKEN": "invalid",
        "GIT_COMMIT": "invalid",
        "NODE_ENV": "invalid",
        "NODE_VERSION": "invalid",
        "PRISMA_ENCRYPTION_KEY": "invalid",
        "SENTRY_DSN": "invalid"
    };

    stubEnvironment(environmentVariables);
};

describe("Environment Variable Parsing", () => {
    beforeAll(() => {
        vi.unstubAllEnvs();
    });

    test("Valid Environment is Parsed", () => {
        const env = stubValidEnvironment();

        expect(loadEnv()).toStrictEqual(env);
    });

    test("Invalid Environment Exits", () => {
        stubInvalidEnvironment();

        expect(loadEnv()).toBeInstanceOf(BaseError);
    });
});