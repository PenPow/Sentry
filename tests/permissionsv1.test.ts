import { Guild, GuildMember, User } from "discord.js";
import { describe, test, expect, vi } from "vitest";
import { permissionsV1 } from "../src/preconditions/SentryRequiresModerationPermissions.js";
import { PreconditionValidationError } from "../src/lib/framework/structures/errors/PreconditionValidationError.js";
import { InternalError } from "../src/lib/framework/structures/errors/InternalError.js";
import stripIndent from "strip-indent";

describe("Permissions V1", () => {
    const baseTargetAsGuildMember = {
        id: "207198455301537793",
        user: {
            bot: false
        },
        guild: {}, // stub to pass isGuildMember typeguard
        permissions: {
            has: vi.fn(() => false),
        },
        roles: {
            highest: 10
        }
    } as unknown as GuildMember;

    const baseTargetAsUser = {
        id: baseTargetAsGuildMember.id,
        bot: false,
        permissions: {
            has: vi.fn() // should not be called
        }
    } as unknown as User;

    const baseModerator = {
        id: "934121887829737562",
        permissions: {
            has: vi.fn(() => true)
        },
        roles: {
            highest: {
                comparePositionTo: vi.fn(() => 1)
            }
        }
    } as unknown as GuildMember;

    const baseGuild = {
        ownerId: "1053668982651109386",
        client: {
            user: {
                id: "943163167683514459"
            }
        },
        members: {
            me: {
                permissions: {
                    has: vi.fn(() => true)
                },
                roles: {
                    highest: {
                        comparePositionTo: vi.fn(() => 1)
                    }
                }
            }
        }
    } as unknown as Guild;

    test("Fails if Target is Moderator", () => {
        const target = { ...baseTargetAsGuildMember, id: baseModerator.id } as GuildMember;

        const calledError = permissionsV1(baseModerator, target, baseGuild).unwrap();

        const error = new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target is self)");

        expect(calledError.name).toStrictEqual(error.name);
        expect(calledError.context).toStrictEqual(error.context);
    });

    test("Fails if Target is Guild Owner", () => {
        const target = { ...baseTargetAsGuildMember, id: baseGuild.ownerId } as GuildMember;

        const calledError = permissionsV1(baseModerator, target, baseGuild).unwrap();

        const error = new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target owns server)");

        expect(calledError.name).toStrictEqual(error.name);
        expect(calledError.context).toStrictEqual(error.context);
    });

    test("Fails if Target is Sentry", () => {
        const target = { ...baseTargetAsGuildMember, id: baseGuild.client.user.id } as GuildMember;

        const calledError = permissionsV1(baseModerator, target, baseGuild).unwrap();

        const error = new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target is Sentry)");

        expect(calledError.name).toStrictEqual(error.name);
        expect(calledError.context).toStrictEqual(error.context);
    });

    test.each(["GuildMember", "User"])("Fails if Target is Bot (%s)", (type) => {
        const target = type === "GuildMember" ? { ...baseTargetAsGuildMember, user: { bot: true }} as GuildMember : { ...baseTargetAsUser, bot: true} as User;

        const calledError = permissionsV1(baseModerator, target, baseGuild).unwrap();

        const error = new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target is bot)");

        expect(calledError.name).toStrictEqual(error.name);
        expect(calledError.context).toStrictEqual(error.context);
    });

    test("Fails if <Guild>.members#me is Uncached", () => {
        const guild = { ...baseGuild, members: { me: undefined }} as unknown as Guild;

        const calledError = permissionsV1(baseModerator, baseTargetAsGuildMember, guild).unwrap();

        const error = new InternalError("Cannot check Sentry's permissions - please report this on github", "Sentry's user is not cached in the guild");

        expect(calledError.name).toStrictEqual(error.name);
        expect(calledError.context).toStrictEqual(error.context);
    });

    test.each(["BanMembers", "KickMembers", "ModerateMembers", "SendMessages", "EmbedLinks"])("Fails if Sentry is missing %s permission", () => {
        const guild = { ...baseGuild, members: { me: { permissions: { has: vi.fn(() => false) }}} } as unknown as Guild;
        
        const calledError = permissionsV1(baseModerator, baseTargetAsGuildMember, guild).unwrap();

        const error = new PreconditionValidationError(
            "Sentry Missing Permissions",
            stripIndent(
                `Sentry requires the following permissions to execute moderation commands, and was missing at least one of them:
                \`\`\`diff
                + Ban Members
                + Kick Members
                + Moderate Members
                + Send Messages
                + Embed Links
                \`\`\``
            )
        );

        expect(calledError.name).toStrictEqual(error.name);
        expect(calledError.context).toStrictEqual(error.context);
    });

    test.each(["BanMembers", "KickMembers", "ModerateMembers", "SendMessages", "EmbedLinks"])("Fails if Moderator is missing %s permission", () => {
        const moderator = { ...baseModerator, permissions: { has: vi.fn(() => false) }} as unknown as GuildMember;

        const calledError = permissionsV1(moderator, baseTargetAsGuildMember, baseGuild).unwrap();

        // eslint-disable-next-line max-len
        const error = new PreconditionValidationError("Missing Permissions", "You require the following permissions to execute this command:\n```diff\n+ Ban Members\n+ Kick Members\n+ Moderate Members```");

        expect(calledError.name).toStrictEqual(error.name);
        expect(calledError.context).toStrictEqual(error.context);
    });

    test("Fails if Target has \"Administrator\" Permission", () => {
        const target = { ...baseTargetAsGuildMember, permissions: { has: vi.fn(() => true )} } as unknown as GuildMember;

        const calledError = permissionsV1(baseModerator, target, baseGuild).unwrap();

        // eslint-disable-next-line max-len
        const error = new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target has administrator permission)");

        expect(calledError.name).toStrictEqual(error.name);
        expect(calledError.context).toStrictEqual(error.context);
    });

    test("Fails if Target's Highest Role >= Sentry's Highest Role", () => {
        // eslint-disable-next-line max-len
        const guild = { ...baseGuild, members: { me: { ...baseGuild.members.me, roles: { highest: { comparePositionTo: vi.fn(() => -1 )}}}} } as unknown as Guild;

        const calledError = permissionsV1(baseModerator, baseTargetAsGuildMember, guild).unwrap();

        // eslint-disable-next-line max-len
        const error = new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target's highest role is higher or equal to mine");

        expect(calledError.name).toStrictEqual(error.name);
        expect(calledError.context).toStrictEqual(error.context);
    });

    test("Fails if Target's Highest Role >= Moderators's Highest Role", () => {
        // eslint-disable-next-line max-len
        const moderator = { ...baseModerator, roles: { highest: { comparePositionTo: vi.fn(() => -1 )}} } as unknown as GuildMember;

        const calledError = permissionsV1(moderator, baseTargetAsGuildMember, baseGuild).unwrap();

        // eslint-disable-next-line max-len
        const error = new PreconditionValidationError("Target is immune", "The target's permissions mean they are immune from punishment (target's highest role is higher or equal to yours)");

        expect(calledError.name).toStrictEqual(error.name);
        expect(calledError.context).toStrictEqual(error.context);
    });

    test("IF Target is instanceof User THEN Permissions are not Checked", () => {
        permissionsV1(baseModerator, baseTargetAsUser, baseGuild);

        // @ts-expect-error stubbed for check
        expect(baseTargetAsUser.permissions.has).not.toBeCalled();
    });

    test("Passes if Permissions are Valid", () => {
        expect(permissionsV1(baseModerator, baseTargetAsGuildMember, baseGuild).isNone()).toStrictEqual(true);
    });
});