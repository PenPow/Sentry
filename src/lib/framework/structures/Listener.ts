import { ClientEvents } from "discord.js";
import { Awaitable } from "../../types/Awaitable.js";

export type Listener<T extends keyof ClientEvents> = {
    event: T
    once: boolean
    
    run(args: ClientEvents[T]): Awaitable<unknown>
}