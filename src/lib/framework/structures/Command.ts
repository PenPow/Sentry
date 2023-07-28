import { 
    AutocompleteInteraction,
    ChatInputCommandInteraction, 
    CommandInteraction, 
    MessageContextMenuCommandInteraction, 
    ModalSubmitInteraction, 
    RESTPostAPIApplicationCommandsJSONBody, 
    UserContextMenuCommandInteraction 
} from "discord.js";

import { Option } from "@sapphire/result";
import { InternalError } from "./errors/InternalError.js";
import { PreconditionValidationError } from "./errors/PreconditionValidationError.js";

export type PreconditionOption = Option<InternalError | PreconditionValidationError>

export type Command = {
    shouldRun?(interaction: CommandInteraction): PreconditionOption

    dev?: boolean;

    chatInputRun?(interaction: ChatInputCommandInteraction): any
    userContextMenuRun?(interaction: UserContextMenuCommandInteraction): any
    messageContextMenuRun?(interaction: MessageContextMenuCommandInteraction): any
    autocompleteRun?(interaction: AutocompleteInteraction): any
    modalRun?(interaction: ModalSubmitInteraction): any

    toJSON(): RESTPostAPIApplicationCommandsJSONBody[]
}