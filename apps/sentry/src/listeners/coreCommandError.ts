import {
  type AutocompleteInteractionPayload,
  type ChatInputCommandErrorPayload,
  type ContextMenuCommandErrorPayload,
  Events,
  Listener,
  type MessageCommandErrorPayload,
} from "@sapphire/framework";
import { type ChatInputSubcommandErrorPayload, type MessageSubcommandErrorPayload, SubcommandPluginEvents } from "@sapphire/plugin-subcommands";
import * as Sentry from "@sentry/node";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: Events.MessageCommandError,
})
export class MessageCommandErrorListener extends Listener<typeof Events.MessageCommandError> {
  public run(error: unknown, ctx: MessageCommandErrorPayload) {
    return Sentry.captureException(error, { level: "error", tags: { event: this.name }, extra: { command: ctx.command.name } });
  }
}

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: Events.ChatInputCommandError,
})
export class ChatInputCommandErrorListener extends Listener<typeof Events.ChatInputCommandError> {
  public run(error: unknown, ctx: ChatInputCommandErrorPayload) {
    return Sentry.captureException(error, { level: "error", tags: { event: this.name }, extra: { command: ctx.command.name } });
  }
}

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: Events.ContextMenuCommandError,
})
export class ContextMenuCommandErrorListener extends Listener<typeof Events.ContextMenuCommandError> {
  public run(error: unknown, ctx: ContextMenuCommandErrorPayload) {
    return Sentry.captureException(error, { level: "error", tags: { event: this.name }, extra: { command: ctx.command.name } });
  }
}

@ApplyOptions<Listener.Options>({
  enabled: process.env.NODE_ENV === "PRODUCTION",
  event: Events.CommandAutocompleteInteractionError,
})
export class AutocompleteCommandErrorListener extends Listener<typeof Events.CommandAutocompleteInteractionError> {
  public run(error: unknown, ctx: AutocompleteInteractionPayload) {
    return Sentry.captureException(error, { level: "error", tags: { event: this.name }, extra: { command: ctx.command.name } });
  }
}

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
