import { Events, Listener } from "@sapphire/framework";
import { AutoModerationActionExecution } from "discord.js";
import normalizeUrl from "normalize-url";

export class AutoModerationActionExecutionEvent extends Listener<typeof Events.AutoModerationActionExecution> {
  public async run(event: AutoModerationActionExecution) {
    const { content, guild, user } = event;
    
  }
}
