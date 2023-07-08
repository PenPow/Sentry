import { 
    APIEmbed,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    CacheType, 
    ChatInputCommandInteraction, 
    CommandInteraction,
    PermissionsBitField, 
    RESTPostAPIApplicationCommandsJSONBody, 
} from "discord.js";
import { Command, PreconditionOption } from "../../lib/framework/structures/Command.js";
import { PermissionsValidator } from "../../utilities/Permissions.js";
import { Option } from "@sapphire/result";
// import { PunishmentLock, createCase } from "../../utilities/Punishments.js";
import { reasonAutocompleteHandler } from "../../handlers/Reason.js";
import { prisma } from "../../utilities/Prisma.js";
import { createEmbed, postModLogMessage } from "../../utilities/Logging.js";
import { PunishmentLock } from "../../utilities/Punishments.js";
import { Duration, Time } from "@sapphire/time-utilities";
import { redis } from "../../utilities/Redis.js";
import { PunishmentScheduledTaskManager } from "../../tasks/PunishmentExpiration.js";
import { Job } from "bullmq";
import { referenceAutocompleteHandler } from "../../handlers/Reference.js";

export default class CaseCommand implements Command {
    public shouldRun(interaction: CommandInteraction<CacheType>): PreconditionOption {
        if(!interaction.inCachedGuild()) return Option.some({ message: 'Not in guild', context: "You must be in a guild to run this command" });

        return Option.none;
    }

    public chatInputRun(interaction: ChatInputCommandInteraction<"cached">) {
        const subcommand = (interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(true)) as "lookup" | "edit" | "freeze";

        if(subcommand === "lookup") {
            return this.lookupCase(interaction);
        } else if(subcommand === "edit") {
            return this.editCase(interaction);
        } else if(subcommand === "freeze") {
            return this.freezeCase(interaction);
        }

        return new Error("Unexpected subcommand (group) type"); // please the typescript overlords
    }

    public async autocompleteRun(interaction: AutocompleteInteraction<"cached">) {
        const option = interaction.options.getFocused(true);

        if(option.name === "new-reason") {
            return interaction.respond(reasonAutocompleteHandler(option));
        } else if(option.name === "case") {
            return interaction.respond(await referenceAutocompleteHandler(interaction.guildId, option));
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
                                        required: true
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
        const modCase = await prisma.punishment.findUnique({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, include: { caseReference: true }});

        if (!modCase) {
            const embed: APIEmbed = {
                title: "No Case Found",
                color: 0xea6e72,
            };
      
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const moderator = { username: modCase.moderatorName, id: modCase.moderatorId, displayAvatarURL: () => modCase.moderatorIconUrl };
    
        const embed = await createEmbed(interaction.guild, moderator, modCase);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    private async editCase(interaction: ChatInputCommandInteraction<"cached">) {
        const caseNo = interaction.options.getInteger("case", true);

        // eslint-disable-next-line max-len
        const modCase = await prisma.punishment.findUnique({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, include: { caseReference: true }});

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

            return PunishmentLock.acquire(`punishment-${modCase.userId}`, async () => {
                await prisma.punishment.update({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, data: { reason } });
        
                const moderator = { username: modCase.moderatorName, id: modCase.moderatorId, displayAvatarURL: () => modCase.moderatorIconUrl };
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

            const key = `punishment-jid-${modCase.action === "VMute" ? "VDeafen" : modCase.action}-${modCase.userId}`;
            
            let jobId = await redis.get(key);
            const job = jobId ? await Job.fromId(PunishmentScheduledTaskManager.queue, jobId) : null;

            if(job)  {
                await job.changeDelay(modCase.duration * Time.Second);
                await job.updateData(modCase);
            }
            else jobId = (await PunishmentScheduledTaskManager.schedule(modCase, { delay: modCase.duration * Time.Second  })).id!;

            await redis.setex(key, modCase.duration, jobId!);

            return PunishmentLock.acquire(`punishment-${modCase.userId}`, async () => {
                // eslint-disable-next-line max-len
                await prisma.punishment.update({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, data: { duration: modCase.duration } });
        
                if(modCase.action === "Timeout") {
                    // eslint-disable-next-line max-len
                    await interaction.guild.members.edit(modCase.userId, { communicationDisabledUntil: new Date(Date.now() + modCase.duration! * Time.Second), reason: modCase.reason });
                }

                const moderator = { username: modCase.moderatorName, id: modCase.moderatorId, displayAvatarURL: () => modCase.moderatorIconUrl };
                const embed = await postModLogMessage(interaction.guild, moderator, { ...modCase, createdAt: new Date(Date.now()) });
                return interaction.editReply({ embeds: [embed] });
            });
        }

        return new Error("Unexpected subcommand type"); // please the typescript overlords
    }

    private async freezeCase(interaction: ChatInputCommandInteraction<"cached">) {
        const caseNo = interaction.options.getInteger("case", true);

        // eslint-disable-next-line max-len
        const modCase = await prisma.punishment.findUnique({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, include: { caseReference: true }});

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

        return PunishmentLock.acquire(`punishment-${modCase.userId}`, async () => {
            await prisma.punishment.update({ where: { guildId_caseId: { guildId: interaction.guildId, caseId: caseNo }}, data: { frozen: true } });
    
            const moderator = { username: modCase.moderatorName, id: modCase.moderatorId, displayAvatarURL: () => modCase.moderatorIconUrl };
            const embed = await postModLogMessage(interaction.guild, moderator, modCase);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }
}