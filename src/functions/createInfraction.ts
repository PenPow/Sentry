import { ChatInputCommandInteraction } from "discord.js";
import { prisma } from "../utilities/Prisma.js";
import { InfractionLock, createCase } from "../utilities/Infractions.js";
import { NonTimedInfractions } from "../types/Infraction.js";

export async function createInfraction(interaction: ChatInputCommandInteraction<"cached">, type: NonTimedInfractions) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const dm = interaction.options.getBoolean("dm", false) ?? true;

    let reference = interaction.options.getInteger("reference", false);
    if(reference) {
        const caseReference = await prisma.infraction.findUnique({ where: { guildId_caseId: { caseId: reference, guildId: interaction.guildId } }});

        if(caseReference) reference = caseReference.id;
    }

    await interaction.deferReply();

    await InfractionLock.acquire(`infraction-${user.id}`, async () => {
        const [, embed] = await createCase(interaction.guild, {
            guildId: interaction.guildId,
            reason,
            duration: null,
            moderatorId: interaction.user.id,
            moderatorName: interaction.user.username,
            moderatorIconUrl: interaction.user.displayAvatarURL(),
            action: type,
            userId: user.id,
            userName: user.username,
            referenceId: reference
        }, { dm: ["Unban", "Untimeout", "VUnmute", "Undeafen"].includes(type) ? dm : false , dry: false });

        if(type === "Undeafen") {
            await prisma.infraction.updateMany({ 
                data: { overturned: true }, 
                where: { guildId: interaction.guildId, userId: user.id, action: { in: ["VMute", "Deafen"] } }
            });
        } else if(type === "VUnmute") {
            await prisma.infraction.updateMany({ 
                data: { overturned: true }, 
                where: { guildId: interaction.guildId, userId: user.id, action: "VMute" }
            });
        }

        await interaction.editReply({ embeds: [embed ]});
    });
}