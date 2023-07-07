import { 
    AutocompleteInteraction,
    ChatInputCommandInteraction, 
    CommandInteraction, 
    MessageContextMenuCommandInteraction, 
    RESTPostAPIApplicationCommandsJSONBody, 
    UserContextMenuCommandInteraction 
} from "discord.js";

import { Awaitable } from "../../types/Awaitable.js";
import { Option } from "@sapphire/result";

export type PreconditionOption = Option<{
    message: string;
    context?: string;
}>

export type Command = {
    shouldRun?(interaction: CommandInteraction): PreconditionOption

    dev?: boolean;

    chatInputRun?(interaction: ChatInputCommandInteraction): Awaitable<unknown>
    userContextMenuRun?(interaction: UserContextMenuCommandInteraction): Awaitable<unknown>
    messageContextMenuRun?(interaction: MessageContextMenuCommandInteraction): Awaitable<unknown>
    autocompleteRun?(interaction: AutocompleteInteraction): Awaitable<unknown>

    toJSON(): RESTPostAPIApplicationCommandsJSONBody[]
}