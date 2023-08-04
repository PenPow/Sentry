/* eslint-disable @typescript-eslint/unbound-method */
import { describe, test, expect, vi, beforeEach, afterAll } from 'vitest';
import { InternalError } from '../src/lib/framework/structures/errors/InternalError.js';
import { UserError } from '../src/lib/framework/structures/errors/UserError.js';
import { PreconditionValidationError } from '../src/lib/framework/structures/errors/PreconditionValidationError.js';
import { APIEmbed, CommandInteraction } from 'discord.js';
import { sendErrorResponse } from '../src/functions/sendErrorResponse.js';
import { createErrorEmbed } from '../src/functions/createErrorEmbed.js';

vi.stubGlobal("client", { logger: { error: vi.fn() } });

describe('Errors', () => {
    describe("Internal Errors", () => {
        const error = new InternalError("Failed to init", "Test.exe did not run");

        test("Error Name is InternalError", () => {
            expect(error.name).toStrictEqual("InternalError");
        });

        test("Error has Message", () => {
            expect(error.message).toStrictEqual("Failed to init");
        });

        test("Error has Context", () => {
            expect(error.context).toStrictEqual("Test.exe did not run");
        });

        test("Error Context is Optional", () => {
            expect(new InternalError("Test").context).toBeUndefined();
        });
    });

    describe("User Errors", () => {
        const error = new UserError("You suck", "How did you break everything???");

        test("Error Name is UserError", () => {
            expect(error.name).toStrictEqual("UserError");
        });

        test("Error has Message", () => {
            expect(error.message).toStrictEqual("You suck");
        });

        test("Error has Context", () => {
            expect(error.context).toStrictEqual("How did you break everything???");
        });

        test("Error Context is Optional", () => {
            expect(new UserError("Test").context).toBeUndefined();
        });
    });

    describe("Precondition Validation Errors", () => {
        const error = new PreconditionValidationError("Precondition Failed", "I just don't want to do work");

        test("Error Name is PreconditionValidationError", () => {
            expect(error.name).toStrictEqual("PreconditionValidationError");
        });

        test("Error has Message", () => {
            expect(error.message).toStrictEqual("Precondition Failed");
        });

        test("Error has Context", () => {
            expect(error.context).toStrictEqual("I just don't want to do work");
        });
    });

    describe("Sending Error Response", () => {
        beforeEach(() => {
            vi.restoreAllMocks();
        });
    
        afterAll(() => {
            vi.resetAllMocks();
        });

        const interaction = { 
            replied: false,
            deferred: false,
            deferReply: vi.fn(() => Promise.resolve()),
            followUp: vi.fn(),
        } as unknown as CommandInteraction;

        const embed = {} as APIEmbed;

        test("Defer + Reply", async () => {
            await sendErrorResponse(interaction, embed);

            expect(interaction.deferReply).toBeCalledTimes(1);
            expect(interaction.followUp).toBeCalledTimes(1);
        });
    });

    describe("Error Embed Creation", () => {
        test("Generic/Unknown Errors", () => {
            const error = new Error("Generic Error");

            const embed = createErrorEmbed(error);

            expect(embed.title).toStrictEqual("An Unknown Error Occurred");

            expect(embed.author).toBeUndefined();
            expect(embed.color).toStrictEqual(0xff595f);

            // eslint-disable-next-line max-len
            expect(embed.description).toStrictEqual(`Please report this on our [GitHub](https://github.com/PenPow/Sentry), posting all relevent details.\n\n\`\`\`js\n${error.stack}\n\`\`\``);

            expect(embed.footer!.text).toStrictEqual("Error");
            expect(embed.footer!.icon_url).toBeUndefined();
            expect(embed.footer!.proxy_icon_url).toBeUndefined();

            expect(embed.timestamp).toBeUndefined();
        });

        test.each(["InternalError", "UserError", "PreconditionValidationError"])("%s", (type) => {
            let error = new Error("This should not exist");

            if(type === "InternalError") error = new InternalError("This is an Internal Error", "Testing Internal Errors");
            else if(type === "UserError") error = new UserError("This is an User Error", "Testing User Errors");
            // eslint-disable-next-line max-len
            else if(type === "PreconditionValidationError") error = new PreconditionValidationError("This is an PreconditionValidationError Error", "Testing PreconditionValidationError Errors");
            
            const embed = createErrorEmbed(error);

            expect(embed.title).toStrictEqual(error.message);

            expect(embed.author).toBeUndefined();
            expect(embed.color).toStrictEqual(0xff595f);

            // eslint-disable-next-line max-len
            expect(embed.description).toStrictEqual("context" in error ? error.context : "");

            expect(embed.footer!.text).toStrictEqual(error.name);
            expect(embed.footer!.icon_url).toBeUndefined();
            expect(embed.footer!.proxy_icon_url).toBeUndefined();

            expect(embed.timestamp).toBeUndefined();
        });
    });
});