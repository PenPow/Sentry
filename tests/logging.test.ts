import { describe, test, expect, vi, afterAll, afterEach, beforeEach } from "vitest";
import { ChannelType, Guild } from "discord.js";
import { createEmbed, getGuildLogChannel } from "../src/utilities/Logging.js";
import { CaseWithReference, UserLike } from "../src/types/Infraction.js";
import { Duration } from "@sapphire/time-utilities";

vi.mock("../src/utilities/Prisma.ts", () => {
    return { 
        prisma: {
            infraction: {
                create: vi.fn(({ data }) => data)
            }
        }
    };
});

vi.mock("../src/utilities/env.ts", () => {
    return {
        loadEnv: vi.fn(() => ({
            PRISMA_ENCRYPTION_KEY: "",
        }))
    };
});

vi.mock("ioredis", () => {
    return { Redis: vi.fn() };
});

vi.mock("../src/tasks/InfractionExpiration.ts", () => {
    return { InfractionScheduledTaskManager: vi.fn() };
});

const fetchChannelStub = vi.fn(() => [
    { name: "modlogs", id: '1119975505706360943', type: ChannelType.GuildText, isTextBased: vi.fn(() => true) },
]);

const guildStub = {
    channels: {
        fetch: fetchChannelStub
    }
} as unknown as Guild;

describe("Logging Utilities", () => {
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

    describe("Embed Creation", () => {        
        const moderator: UserLike = {
            username: 'PenPow',
            id: '207198455301537793',
            iconUrl: "https://www.penpow.dev/img/me.webp"
        };

        const baseCaseData: CaseWithReference = {
            id: 2,
            caseId: 2,
            createdAt: new Date("2023-07-30T16:10:25.657Z"),
            duration: null,
            guildId: "000000000000000000",
            moderatorId: moderator.id,
            moderatorName: moderator.username,
            moderatorIconUrl: moderator.iconUrl,
            reason: "Unit Testing!",
            modLogMessageId: null,
            action: "Ban",
            userId: "330004783350153218",
            userName: "Test Subject",
            referenceId: null,
            caseReference: null,
            frozen: false
        };

        test("Creates Base Embed", async () => {
            const embed = await createEmbed(guildStub, moderator, { ...baseCaseData });

            expect(embed.author!.icon_url).toStrictEqual(moderator.iconUrl);
            expect(embed.author!.name).toStrictEqual(`${moderator.username} (${moderator.id})`);
            expect(embed.author!.proxy_icon_url).toBeUndefined();
            expect(embed.author!.url).toBeUndefined();

            expect(embed.color).toStrictEqual(0xff595e);

            const description = embed.description!.split('\n');

            expect(description[0]).toStrictEqual(`**Member**: \`${baseCaseData.userName}\` (${baseCaseData.userId})`);
            expect(description[1]).toStrictEqual(`**Action**: Ban`);
            expect(description[2]).toStrictEqual(`**Reason**: ${baseCaseData.reason}`);

            expect(embed.footer!.text).toStrictEqual(`Case #${baseCaseData.caseId}`);
            expect(embed.footer!.icon_url).toBeUndefined();
            expect(embed.footer!.proxy_icon_url).toBeUndefined();

            expect(embed.timestamp).toStrictEqual(new Date("2023-07-30T16:10:25.657Z").toISOString());

            expect(fetchChannelStub).toBeCalledTimes(0);
        });

        test("Creates Embed w/Reference wo/Message ID", async () => {
            const embed = await createEmbed(guildStub, moderator, { 
                ...baseCaseData, 
                referenceId: 1, 
                caseReference: {
                    ...baseCaseData,
                    modLogMessageId: null, 
                    caseId: 1, 
                } 
            });

            const description = embed.description!.split('\n');

            expect(description[3]).toStrictEqual(`**Case Reference**: \`#1\``);

            expect(fetchChannelStub).toBeCalledTimes(1);
        });
        
        test("Creates Embed w/Reference w/Message ID", async () => {
            const embed = await createEmbed(guildStub, moderator, { 
                ...baseCaseData, 
                referenceId: 1, 
                caseReference: {
                    ...baseCaseData,
                    modLogMessageId: "1134076085051600936", 
                    caseId: 1, 
                } 
            });

            const description = embed.description!.split('\n');

            expect(description[3]).toStrictEqual(`**Case Reference**: [#1](https://discord.com/channels/@me/1119975505706360943/1134076085051600936)`);

            expect(fetchChannelStub).toBeCalledTimes(1);
        });

        test("Creates Embed w/Frozen Infraction", async () => {
            const embed = await createEmbed(guildStub, moderator, { 
                ...baseCaseData, 
                frozen: true 
            });

            const description = embed.description!.split('\n');

            expect(description[4]).toStrictEqual(`**Flags**`);
            expect(description[5]).toStrictEqual('🧊 Frozen');
        });

        test("Creates Embed w/Duration", async () => {
            const duration = new Duration('27d23h59m59s').offset;
            
            const embed = await createEmbed(guildStub, moderator, { 
                ...baseCaseData, 
                duration
            });

            const description = embed.description!.split('\n');

            expect(description[2]).toStrictEqual("**Expiration**: <t:4109932425:R>");
        });
    });
    
    describe("Guild Audit Log Channel", () => {
        test("Finds Valid Channel", async () => {
            const channels = [
                { name: "modlogs", id: '1119975505706360943', type: ChannelType.GuildText, isTextBased: vi.fn(() => true) },
            ];
    
            const fetchMoreChannelsStub = vi.fn(() => channels);
    
            const guildAuditLogStub = {
                channels: {
                    fetch: fetchMoreChannelsStub
                }
            } as unknown as Guild;
            
            expect(JSON.stringify(await getGuildLogChannel(guildAuditLogStub))).toStrictEqual(JSON.stringify(channels[0]));

            expect(fetchMoreChannelsStub).toBeCalledTimes(1);
        });

        test("Filters Invalid Channels", async () => {
            const channels = [
                { name: "mood-logs", id: '1119975505706360943', type: ChannelType.GuildText, isTextBased: vi.fn(() => true) }, // invalid name
                { name: "modlogs", id: '1119975505706360943', type: ChannelType.GuildAnnouncement, isTextBased: vi.fn(() => true) }, // invalid type
                { name: "modlogs", id: '1119975505706360943', type: ChannelType.GuildText, isTextBased: vi.fn(() => false) }, // not text based
                { name: "sentry-logs", id: '1119975505706360943', type: ChannelType.GuildText, isTextBased: vi.fn(() => true) }, // ✅ valid
            ];
    
            const fetchMoreChannelsStub = vi.fn(() => channels);
    
            const guildAuditLogStub = {
                channels: {
                    fetch: fetchMoreChannelsStub
                }
            } as unknown as Guild;
            
            expect(JSON.stringify(await getGuildLogChannel(guildAuditLogStub))).toStrictEqual(JSON.stringify(channels[3]));

            expect(fetchMoreChannelsStub).toBeCalledTimes(1);
        });
        
        test("Finds Valid Channel if Multiple Exist", async () => {
            const channels = [
                { name: "logs", id: '1119975505706360943', type: ChannelType.GuildText, isTextBased: vi.fn(() => true) },
                { name: "modlogs", id: '1119975505706360943', type: ChannelType.GuildText, isTextBased: vi.fn(() => true) },
            ];
    
            const fetchMoreChannelsStub = vi.fn(() => channels);
    
            const guildAuditLogStub = {
                channels: {
                    fetch: fetchMoreChannelsStub
                }
            } as unknown as Guild;
            
            expect(JSON.stringify(await getGuildLogChannel(guildAuditLogStub))).toStrictEqual(JSON.stringify(channels[0]));

            expect(fetchMoreChannelsStub).toBeCalledTimes(1);
        });

        test("Returns null if no Channels Exist", async () => {
            const channels: { name: string, id: string, type: ChannelType, isTextBased: () => true }[] = [];
    
            const fetchMoreChannelsStub = vi.fn(() => channels);
    
            const guildAuditLogStub = {
                channels: {
                    fetch: fetchMoreChannelsStub
                }
            } as unknown as Guild;
            
            await expect(getGuildLogChannel(guildAuditLogStub)).resolves.toBeNull();

            expect(fetchMoreChannelsStub).toBeCalledTimes(1);
        });

        test("Returns null if no Non-GuildText channels exist", async () => {
            const channels = [
                { name: "modlogs", id: '1119975505706360943', type: ChannelType.GuildVoice, isTextBased: vi.fn(() => true) },
                { name: "modlog", id: '1119975505706360944', type: ChannelType.GuildStageVoice, isTextBased: vi.fn(() => false) }
            ];
    
            const fetchMoreChannelsStub = vi.fn(() => channels);
    
            const guildAuditLogStub = {
                channels: {
                    fetch: fetchMoreChannelsStub
                }
            } as unknown as Guild;
            
            await expect(getGuildLogChannel(guildAuditLogStub)).resolves.toBeNull();

            expect(fetchMoreChannelsStub).toBeCalledTimes(1);
        });
    });
});