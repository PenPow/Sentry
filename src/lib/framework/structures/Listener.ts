import { ClientEvents } from "discord.js";

export type Listener<T extends keyof ClientEvents> = {
    event: T
    once: boolean
    
    run(args: ClientEvents[T]): any
}