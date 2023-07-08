import { AutocompleteInteraction, ClientEvents, CommandInteraction, ModalSubmitInteraction } from "discord.js";
import { Listener } from "../structures/Listener.js";
import { Option } from '@sapphire/result';

export default class InteractionCreateListener implements Listener<"interactionCreate"> {
    public readonly event = "interactionCreate";
    public readonly once = false;

    public async run([interaction]: ClientEvents["interactionCreate"]) {
        if(interaction.isAutocomplete()) await this.handleAutocomplete(interaction);
        if(interaction.isCommand()) await this.handleCommand(interaction);
        if(interaction.isModalSubmit()) await this.handleModal(interaction);
    }

    private handleAutocomplete(interaction: AutocompleteInteraction) {
        const { commandName } = interaction;

        const command = interaction.client.registries.commands.get(commandName);
        if(!command) return;

        // eslint-disable-next-line max-len
        if(!command.autocompleteRun) return interaction.client.emit("autocompleteError", interaction, new Error(`${commandName} has no autocomplete run function`));

        return command.autocompleteRun(interaction);
    }

    private handleModal(interaction: ModalSubmitInteraction) {
        const commandName = interaction.customId.split('.')[0]!;

        const command = interaction.client.registries.commands.get(commandName);
        if(!command) return;

        if(!command.modalRun) return interaction.client.emit("modalError", interaction, new Error(`${commandName} has no modal run function`));

        return command.modalRun(interaction);
    }
    
    private async handleCommand(interaction: CommandInteraction) {
        const { commandName } = interaction;

        const command = interaction.client.registries[interaction.isChatInputCommand() ? "commands" : "aliases"].get(commandName);
        if(!command) return;

        const preconditionResult = command.shouldRun?.(interaction) ?? Option.none;
        // TODO: Add preconditionFailed listener
        if(preconditionResult.isSome()) return interaction.client.emit("preconditionFailed", interaction, preconditionResult);

        try {
            if(interaction.isChatInputCommand()) {
                if(!command.chatInputRun) throw new Error(`${commandName} is a chat input command, but no run method is defined for it`);

                await command.chatInputRun(interaction);
            } else if(interaction.isUserContextMenuCommand()) {
                if(!command.userContextMenuRun) throw new Error(`${commandName} is a user context menu command, but no run method is defined for it`);

                await command.userContextMenuRun(interaction);
            } else if(interaction.isMessageContextMenuCommand()) {
                if(!command.messageContextMenuRun) throw new Error(`${commandName} is a message context menu command, but no run method is defined for it`);

                await command.messageContextMenuRun(interaction);
            }

            // eslint-disable-next-line no-useless-return
            return;
        }
        catch (err) {
            return interaction.client.emit("commandError", interaction, err as Error); // TODO: Add command error listener
        }
    }
}