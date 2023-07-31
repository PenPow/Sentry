import { describe, test, expect, vi, afterAll, afterEach, beforeEach } from "vitest";
import { convertActionToColor, createCase, prettifyCaseActionName } from "../src/utilities/Punishments.js";
import { CaseAction } from "@prisma/client";
import { Case, NonTimedPunishments } from "../src/types/Punishment.js";
import { Guild } from "discord.js";
import { Duration, Time } from "@sapphire/time-utilities";

vi.stubGlobal("vitest", true);
vi.stubGlobal("client", {
    logger: console
});

vi.mock("../src/utilities/Prisma.ts", () => {
    return { 
        prisma: {
            punishment: {
                create: vi.fn(({ data }) => data)
            },
            guild: {
                upsert: vi.fn()
            }
        }
    };
});

vi.mock("../src/lib/framework/structures/SentryClient.ts", () => {
    return { 
        SentryClient: vi.fn(() => ({ 
            logger: { error: vi.fn() }, 
            login: vi.fn(),
            environment: {
                "DEVELOPMENT_GUILD_ID": "stub",
                "DISCORD_TOKEN": "stub",
                "GIT_COMMIT": "stub",
                "NODE_ENV": "stub",
                "NODE_VERSION": "stub",
                "PRISMA_ENCRYPTION_KEY": "stub",
                "SENTRY_DSN": "stub"
            }
        })) 
    };
});

vi.mock("@sentry/node", () => {
    return { 
        captureException: vi.fn(), 
        init: vi.fn(),
        Integrations: {
            Undici: vi.fn(),
        },
        setTags: vi.fn()
    };
});

vi.mock("@sentry/integrations", () => {
    return { RewriteFrames: vi.fn() };
});

vi.mock("../src/utilities/env.ts", () => {
    return {
        loadEnv: vi.fn(() => ({
            "DEVELOPMENT_GUILD_ID": "stub",
            "DISCORD_TOKEN": "stub",
            "GIT_COMMIT": "stub",
            "NODE_ENV": "stub",
            "NODE_VERSION": "stub",
            "PRISMA_ENCRYPTION_KEY": "stub",
            "SENTRY_DSN": "stub"
        }))
    };
});

vi.mock("ioredis", () => {
    return { 
        Redis: vi.fn(() => ({ 
            incr: vi.fn(() => 1),
            get: vi.fn((key: string) => {
                const action = key.split('-')[2]! as Exclude<CaseAction, NonTimedPunishments>;
            
                if(action === "Warn") return "1";
                else if(action === "Ban") return "2";
                else if(action === "Timeout") return "3";
                else if(action === "VDeafen") return "4";
                else if(action === "VMute") return "5";
            
                throw new Error("Invalid Action");
            }),
            setex: vi.fn()
        })) 
    };
});

vi.mock("../src/functions/createErrorEmbed.ts", () => {
    return { createErrorEmbed: vi.fn(() => "error embed") };
});

vi.mock("../src/tasks/PunishmentExpiration.ts", () => {
    return { PunishmentScheduledTaskManager: {
        schedule: vi.fn(),
    } };
});

vi.mock("../src/utilities/Logging.ts", () => {
    return { postModLogMessage: vi.fn(() => "punishment embed") }; // stub it out, we already tested it
});

vi.mock("bullmq", () => {
    return { Job: {
        fromId: (_queue: any, jobId: string) => {
            if(parseInt(jobId, 10) > 0 && parseInt(jobId, 10) <= 5) return {
                changeDelay: vi.fn(),
                updateData: vi.fn(), // stub it out
            };

            return undefined;
        }
    }};
});

describe("Punishment Utilities", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.useFakeTimers();

        vi.setSystemTime(new Date("2023-07-30T16:10:25.657Z"));
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
    });

    afterAll(() => {
        vi.resetAllMocks();
    });

    describe("Case Colours", () => {
        test("Warns are Yellow", () => {
            expect(convertActionToColor("Warn")).toStrictEqual(0xffca3a);
        });

        test("Timeouts are Yellow", () => {
            expect(convertActionToColor("Timeout")).toStrictEqual(0xffca3a);
        });

        test("VMutes are Yellow", () => {
            expect(convertActionToColor("VMute")).toStrictEqual(0xffca3a);
        });

        test("VDeafens are Yellow", () => {
            expect(convertActionToColor("VDeafen")).toStrictEqual(0xffca3a);
        });

        test("Kicks are Orange", () => {
            expect(convertActionToColor("Kick")).toStrictEqual(0xffa05e);
        });

        test("Untimeouts are Grey", () => {
            expect(convertActionToColor("Untimeout")).toStrictEqual(0x1e1e21);
        });

        test("Unbans are Green", () => {
            expect(convertActionToColor("Unban")).toStrictEqual(0x8ac926);
        });

        test("Bans are Red", () => {
            expect(convertActionToColor("Ban")).toStrictEqual(0xff595e);
        });
    });

    describe("Case Action Names", () => {
        test.each(["Warn", "Timeout", "Kick", "Softban", "Ban", "Unban", "Untimeout"])("Punishment of type %s returns itself", (action) => {
            expect(prettifyCaseActionName(action as CaseAction)).toStrictEqual(action);
        });

        test("VMutes return Voice Mute", () => {
            expect(prettifyCaseActionName("VMute")).toStrictEqual("Voice Mute");
        });

        test("VDeafens return Voice Deafen", () => {
            expect(prettifyCaseActionName("VDeafen")).toStrictEqual("Voice Deafen");
        });
    });


    describe("Case Creation", () => {
        const baseCaseData: Case = {
            duration: null,
            guildId: '893846199063445514',
            moderatorId: '207198455301537793',
            moderatorIconUrl: 'https://www.penpow.dev/img/me.webp',
            moderatorName: 'PenPow',
            reason: 'Unit Testing',
            action: 'Ban', // replaced in fns later
            userName: 'Test Dummy',
            userId: '1053668982651109386'
        };

        const sendFn = vi.fn();
        const banFn = vi.fn();
        const kickFn = vi.fn();
        const unbanFn = vi.fn();
        const memberEditFn = vi.fn();

        const guildStub = {
            client: {
                users: {
                    send: sendFn
                }
            },
            members: {
                ban: banFn,
                kick: kickFn,
                edit: memberEditFn,
            },
            bans: {
                remove: unbanFn,
            }
        } as unknown as Guild;

        test("Creates Warn Punishment", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Warn'
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
        });

        test("Created Timed Warn Punishment", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Warn',
                duration: new Duration("27h59m59s").offset
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1,
                duration: Math.ceil(new Duration("27h59m59s").offset / Time.Second)
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
        });

        test("Creates Timeout Punishment", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Timeout',
                duration: new Duration("27h59m59s").offset
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1,
                duration: Math.ceil(new Duration("27h59m59s").offset / Time.Second)
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
            expect(memberEditFn).toBeCalledTimes(1);
        });

        test("Creates VMute Punishment", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'VMute'
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
            expect(memberEditFn).toBeCalledTimes(1);
        });

        test("Creates Timed VMute Punishment", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'VMute',
                duration: new Duration("27h59m59s").offset
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1,
                duration: Math.ceil(new Duration("27h59m59s").offset / Time.Second)
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
            expect(memberEditFn).toBeCalledTimes(1);
        });

        test("Creates VDeafen Punishment", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'VDeafen'
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
            expect(memberEditFn).toBeCalledTimes(1);
        });

        test("Creates Timed VDeafen Punishment", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'VDeafen',
                duration: new Duration("27h59m59s").offset
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1,
                duration: Math.ceil(new Duration("27h59m59s").offset / Time.Second)
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
            expect(memberEditFn).toBeCalledTimes(1);
        });

        test("Creates Kick Punishment", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Kick'
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
            expect(kickFn).toBeCalledTimes(1);
        });

        test("Creates Softban Punishment", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Softban'
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
            expect(banFn).toBeCalledTimes(1);
            expect(unbanFn).toBeCalledTimes(1);
        });

        test("Creates Ban Punishment", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Ban'
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
            expect(banFn).toBeCalledTimes(1);
        });

        test("Creates Unban", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Unban'
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).not.toBeCalled();
            expect(unbanFn).toBeCalledTimes(1);
        });

        test("Can Freeze Punishment on Creation", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Warn',
                frozen: true
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
        });

        test("Can Reference Another Case", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Warn',
                referenceId: 2
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).toBeCalledTimes(1);
        });

        test("Dry Punishments Exits Early", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Ban'
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: true });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).not.toBeCalled();
            expect(banFn).not.toBeCalled();
        });

        test("DM False doesn't DM User", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Warn',
                frozen: true
            };

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: false, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("punishment embed");

            expect(sendFn).not.toBeCalled();
        });

        test("Returns Error Embed if it cannot actually punish the user", async () => {
            const caseData: Case = {
                ...baseCaseData,
                action: 'Ban',
                frozen: true
            };

            guildStub.members.ban = vi.fn(() => { 
                throw new Error("Failed to Ban"); 
            });

            const [punishment, embed] = await createCase(guildStub, caseData, { dm: true, dry: false });

            expect(punishment).toStrictEqual({
                ...caseData,
                caseId: 1
            });

            expect(embed).toStrictEqual("error embed");

            expect(sendFn).toBeCalledTimes(1);
        });
    });
});