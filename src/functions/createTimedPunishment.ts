import { CaseAction } from "@prisma/client";
import { Duration, Time } from "@sapphire/time-utilities";
import { ChatInputCommandInteraction } from "discord.js";
import { prisma } from "../utilities/Prisma.js";
import { PunishmentLock, createCase } from "../utilities/Punishments.js";
import { NonTimedPunishments } from "../types/Punishment.js";

export async function createTimedPunishment(interaction: ChatInputCommandInteraction<"cached">, type: Exclude<CaseAction, NonTimedPunishments>) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const dm = interaction.options.getBoolean("dm", false) ?? true;

    let reference = interaction.options.getInteger("reference", false);
    if(reference) {
        const caseReference = await prisma.punishment.findUnique({ where: { guildId_caseId: { caseId: reference, guildId: interaction.guildId } }});

        if(caseReference) reference = caseReference.id;
    }

    const expirationOption = interaction.options.getString("expiration", false);
    let expiration = expirationOption ? new Duration(expirationOption) : null;

    if(type === "Timeout" && expiration && expiration.offset / Time.Day >= 28) expiration = new Duration('27d23h59m59s');

    await interaction.deferReply();

    await PunishmentLock.acquire(`punishment-${user.id}`, async () => {
        const [, embed] = await createCase(interaction.guild, {
            guildId: interaction.guildId,
            reason,
            duration: Number.isNaN(expiration?.offset) ? null : expiration ? expiration.offset : null, // HACK: god there must be a nicer way to write this
            moderatorId: interaction.user.id,
            action: type,
            userId: user.id,
            userName: user.username,
            referenceId: reference
        }, { dm, dry: false });

        await interaction.editReply({ embeds: [embed ]});
    });
}