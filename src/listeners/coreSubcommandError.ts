import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { type ChatInputSubcommandErrorPayload, type MessageSubcommandErrorPayload, SubcommandPluginEvents } from "@sapphire/plugin-subcommands";
import * as Sentry from "@sentry/node";

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: SubcommandPluginEvents.MessageSubcommandError,
})
export class MessageSubcommandErrorListener extends Listener<typeof SubcommandPluginEvents.MessageSubcommandError> {
  public run(error: unknown, ctx: MessageSubcommandErrorPayload) {
    return Sentry.captureException(error, { level: "error", tags: { event: this.name }, extra: { command: ctx.command.name } });
  }
}

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: SubcommandPluginEvents.ChatInputSubcommandError,
})
export class ChatInputSubcommandErrorListener extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandError> {
  public run(error: unknown, ctx: ChatInputSubcommandErrorPayload) {
    return Sentry.captureException(error, { level: "error", tags: { event: this.name }, extra: { command: ctx.command.name } });
  }
}
