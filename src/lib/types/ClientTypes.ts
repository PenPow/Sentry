import { ClientEvents, Collection } from "discord.js";
import { Command } from "../framework/structures/Command.js";
import { Listener } from "../framework/structures/Listener.js";

type Registries = {
    commands: Command,
    listeners: Listener<keyof ClientEvents>
}

export type WrappedRegistry = {
    readonly [Key in keyof Registries]: Collection<string, Registries[Key]>
}