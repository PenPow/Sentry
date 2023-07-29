import { APIEmbed, ButtonInteraction, CommandInteraction, ModalSubmitInteraction } from "discord.js";

export function sendErrorResponse(interaction: CommandInteraction | ModalSubmitInteraction | ButtonInteraction, embed: APIEmbed) {
    if(!interaction.replied) {
        return interaction.reply({ embeds: [embed], ephemeral: true });
    } else if(interaction.deferred) {
        return interaction.editReply({ embeds: [embed] });
    }
    
    return interaction.followUp({ embeds: [embed], ephemeral: true });
}