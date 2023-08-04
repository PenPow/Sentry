import { APIEmbed, ButtonInteraction, CommandInteraction, ModalSubmitInteraction } from "discord.js";

export async function sendErrorResponse(interaction: CommandInteraction | ModalSubmitInteraction | ButtonInteraction, embed: APIEmbed) {
    await interaction.deferReply({ ephemeral: true}).catch();
    
    return interaction.followUp({ embeds: [embed], ephemeral: true });
}