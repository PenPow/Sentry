import { 
    APIEmbed,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    CacheType, 
    ChatInputCommandInteraction, 
    CommandInteraction,
    EmbedBuilder,
    PermissionsBitField, 
    RESTPostAPIApplicationCommandsJSONBody, 
} from "discord.js";
import { Command, PreconditionOption } from "../../lib/framework/structures/Command.js";
import { PermissionsValidator } from "../../utilities/Permissions.js";
import { Option } from "@sapphire/result";
import { reasonAutocompleteHandler } from "../../handlers/Reason.js";
import { prisma } from "../../utilities/Prisma.js";
import { createEmbed, postModLogMessage } from "../../utilities/Logging.js";
import { InfractionLock } from "../../utilities/Infractions.js";
import { Duration, Time } from "@sapphire/time-utilities";
import { redis } from "../../utilities/Redis.js";
import { InfractionScheduledTaskManager } from "../../tasks/InfractionExpiration.js";
import { Job } from "bullmq";
import { clamp } from "../../utilities/Clamp.js";
import { referenceAutocompleteHandler } from "../../handlers/Reference.js";
import { UserLike } from "../../types/Infraction.js";
import { InternalError } from "../../lib/framework/structures/errors/InternalError.js";
import { PreconditionValidationError } from "../../lib/framework/structures/errors/PreconditionValidationError.js";
import { PaginatedMessage } from "@sapphire/discord.js-utilities";
import { durationAutocompleteHandler } from "../../handlers/Duration.js";

// ^ god these imports are a mess

export default class CaseCommand implements Command {
    public shouldRun(interaction: CommandInteraction<CacheType>): PreconditionOption {
        if(!interaction.inCachedGuild()) return Option.some(new PreconditionValidationError('Not in guild', "You must be in a guild to run this command"));

        return Option.none;
    }

    public chatInputRun(interaction: ChatInputCommandInteraction<"cached">) {
        // eslint-disable-next-line max-len
        const subcommand = (interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(true)) as "lookup" | "search" | "edit" | "freeze";

        if(subcommand === "lookup") {
            return this.lookupCase(interaction);
        } else if (subcommand === "search") {
            return this.searchCase(interaction);
        } else if(subcommand === "edit") {
            return this.editCase(interaction);
        } else if(subcommand === "freeze") {
            return this.freezeCase(interaction);
        }

        throw new InternalError("Unexpected subcommand (group) type"); // please the typescript overlords
    }

    public async autocompleteRun(interaction: AutocompleteInteraction<"cached">) {
        const option = interaction.options.getFocused(true);

        if(option.name === "new-reason") {
            return interaction.respond(reasonAutocompleteHandler(option));
        } else if(option.name === "case") {
            return interaction.respond(await referenceAutocompleteHandler(interaction.guildId, option));
        } else if (option.name === "new-duration") {
            return interaction.respond(durationAutocompleteHandler(option));
        }
    }

    public toJSON(): RESTPostAPIApplicationCommandsJSONBody[] {
        return [
            {
                name: 'cases',
                description: 'Manage moderation cases here',
                dm_permission: false,
                default_member_permissions: PermissionsValidator.parse(new PermissionsBitField(PermissionsBitField.Flags.ModerateMembers).valueOf()),
                options: [
                    {
                        name: 'lookup',
                        description: 'Get the details of an individual case',
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [{
                            name: 'case',
                            description: 'The case number to lookup',
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            autocomplete: true,
                            min_value: 1
                        }]
                    },
                    {
                        name: 'search',
                        description: 'Search for cases made by a certain moderator',
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [{
                            name: 'moderator',
                            description: 'The moderator to search cases for',
                            type: ApplicationCommandOptionType.User,
                            required: true,
                        }]
                    },
                    {
                        name: 'edit',
                        description: 'Modify a case',
                        type: ApplicationCommandOptionType.SubcommandGroup,
                        options: [
                            {
                                name: 'reason',
                                description: "Edit the reason for the case",
                                type: ApplicationCommandOptionType.Subcommand,
                                options: [
                                    {
                                        name: 'case',
                                        description: 'The case number to lookup',
                                        type: ApplicationCommandOptionType.Integer,
                                        required: true,
                                        autocomplete: true,
                                        min_value: 1
                                    },
                                    {
                                        name: 'new-reason',
                                        description: 'The new reason for the case',
                                        type: ApplicationCommandOptionType.String,
                                        max_length: 500,
                                        required: true,
                                        autocomplete: true
                                    }]
                            },
                            {
                                name: 'duration',
                                description: "Edit the duration of a case",
                                type: ApplicationCommandOptionType.Subcommand,
                                options: [
                                    {
                                        name: 'case',
                                        description: 'The case number to lookup',
                                        type: ApplicationCommandOptionType.Integer,
                                        required: true,
                                        autocomplete: true,
                                        min_value: 1
                                    },
                                    {
                                        name: 'new-duration',
                                        description: 'The new duration for the case (pass in a duration string)',
                                        type: ApplicationCommandOptionType.String,
                                        required: true,
                                        autocomplete: true
                                    }]
                            }
                        ]
                    },
                    {
                        name: 'freeze',
                        description: 'Freeze a case to prevent further modifications',
                        type: ApplicationCommandOptionType.Subcommand,
                        options: [{
                            name: 'case',
                            description: 'The case number to freeze',
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            autocomplete: true,
                            min_value: 1
                        }]
                    },
                ]
            }];
    }

    private async lookupCase(interaction: ChatInputCommandInteraction<"cached">) {
        const caseNo = interaction.options.getInteger("case", true);

        // eslint-disable-next-line max-len
        const modCase = await prisma.infraction.findUnique({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, include: { caseReference: true }});

        if (!modCase) {
            const embed: APIEmbed = {
                title: "No Case Found",
                color: 0xea6e72,
            };
      
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const moderator: UserLike = { username: modCase.moderatorName, id: modCase.moderatorId, iconUrl: modCase.moderatorIconUrl };
    
        const embed = await createEmbed(interaction.guild, moderator, modCase);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private async searchCase(interaction: ChatInputCommandInteraction<"cached">) {
        const moderator = interaction.options.getUser("moderator", true);

        const cases = await prisma.infraction.findMany({ 
            include: { caseReference: true }, 
            where: { guildId: interaction.guildId, moderatorId: moderator.id }
        }) ?? [];

        if(!cases.length)  {
            const embed: APIEmbed = {
                title: "No Cases Found",
                color: 0xea6e72,
            };
       
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const embeds = clamp(cases, 24).map((modCase) => createEmbed(
            interaction.guild,
            { username: modCase.moderatorName, id: modCase.moderatorId, iconUrl: modCase.moderatorIconUrl }, 
            modCase
        ));

        const message = new PaginatedMessage();
        // NOTE: addPageEmbeds doesnt work... don't know why
        (await Promise.all(embeds)).map((embed) => new EmbedBuilder(embed)).forEach((embed) => message.addPageEmbed(embed));

        if (cases.length >= 25) {
            message.addPageEmbed(
                new EmbedBuilder({
                    title: `And ${cases.length - 25} more case${cases.length - 25 === 1 ? "" : "s"}...`,
                    color: 0xea6e72,
                })
            );
        }

        await interaction.deferReply({ ephemeral: true }); // makes paginator ephemeral

        return message.run(interaction, interaction.user);
    }

    private async editCase(interaction: ChatInputCommandInteraction<"cached">) {
        const caseNo = interaction.options.getInteger("case", true);

        // eslint-disable-next-line max-len
        const modCase = await prisma.infraction.findUnique({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, include: { caseReference: true }});

        if (!modCase) {
            const embed: APIEmbed = {
                title: "No Case Found",
                color: 0xea6e72,
            };
       
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if(modCase.frozen) {
            const embed: APIEmbed = {
                title: "🧊 Case Frozen",
                color: 0x1982c4,
            };
      
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand(true) as "reason" | "duration";

        if(subcommand === "reason") {
            const reason = interaction.options.getString('new-reason', true);

            modCase.reason = reason;

            return InfractionLock.acquire(`infraction-${modCase.userId}`, async () => {
                await prisma.infraction.update({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, data: { reason } });
        
                const moderator: UserLike = { username: modCase.moderatorName, id: modCase.moderatorId, iconUrl: modCase.moderatorIconUrl };
                const embed = await postModLogMessage(interaction.guild, moderator, modCase);
                return interaction.editReply({ embeds: [embed] });
            });
        } else if(subcommand === "duration") {
            const expirationOption = interaction.options.getString('new-duration', true);

            let expiration = expirationOption ? new Duration(expirationOption) : null;

            if(modCase.action === "Timeout" && expiration && expiration.offset / Time.Day >= 28) expiration = new Duration('27d23h59m59s');

            if(!expiration || Number.isNaN(expiration?.offset)) {
                const embed: APIEmbed = {
                    title: "Invalid Duration",
                    color: 0xea6e72,
                };
           
                return interaction.editReply({ embeds: [embed] });
            }

            // console.log(new Date(modCase.createdAt.getTime() + modCase.duration! * Time.Second).toUTCString())
            // console.log(new Date(Date.now()).toUTCString())

            if(new Date(modCase.createdAt.getTime() + modCase.duration! * Time.Second).getTime() < new Date(Date.now()).getTime()) {
                const embed: APIEmbed = {
                    title: "Case Duration already Elapsed",
                    color: 0xea6e72,
                };
           
                return interaction.editReply({ embeds: [embed] });
            }

            modCase.duration = expiration.offset / Time.Second;

            const key = `infraction-jid-${modCase.action === "VMute" ? "Deafen" : modCase.action}-${modCase.userId}`;
            
            let jobId = await redis.get(key);
            const job = jobId ? await Job.fromId(InfractionScheduledTaskManager.queue, jobId) : null;

            if(job)  {
                await job.changeDelay(modCase.duration * Time.Second);
                await job.updateData(modCase);
            }
            else jobId = (await InfractionScheduledTaskManager.schedule(modCase, { delay: modCase.duration * Time.Second  })).id!;

            await redis.setex(key, modCase.duration, jobId!);

            return InfractionLock.acquire(`infraction-${modCase.userId}`, async () => {
                // eslint-disable-next-line max-len
                await prisma.infraction.update({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, data: { duration: modCase.duration } });
        
                if(modCase.action === "Timeout") {
                    // eslint-disable-next-line max-len
                    await interaction.guild.members.edit(modCase.userId, { communicationDisabledUntil: new Date(Date.now() + modCase.duration! * Time.Second), reason: modCase.reason });
                }

                const moderator: UserLike = { username: modCase.moderatorName, id: modCase.moderatorId, iconUrl: modCase.moderatorIconUrl };
                const embed = await postModLogMessage(interaction.guild, moderator, { ...modCase, createdAt: new Date(Date.now()) });
                return interaction.editReply({ embeds: [embed] });
            });
        }

        throw new InternalError("Unexpected subcommand type"); // please the typescript overlords
    }

    private async freezeCase(interaction: ChatInputCommandInteraction<"cached">) {
        const caseNo = interaction.options.getInteger("case", true);

        // eslint-disable-next-line max-len
        const modCase = await prisma.infraction.findUnique({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, include: { caseReference: true }});

        if (!modCase) {
            const embed: APIEmbed = {
                title: "No Case Found",
                color: 0xea6e72,
            };
      
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if(modCase.frozen) {
            const embed: APIEmbed = {
                title: "Case Already Frozen",
                color: 0x1982c4,
            };
      
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        modCase.frozen = true;

        return InfractionLock.acquire(`infraction-${modCase.userId}`, async () => {
            await prisma.infraction.update({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, data: { frozen: true } });
    
            const moderator: UserLike = { username: modCase.moderatorName, id: modCase.moderatorId, iconUrl: modCase.moderatorIconUrl };
            const embed = await postModLogMessage(interaction.guild, moderator, modCase);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }
}