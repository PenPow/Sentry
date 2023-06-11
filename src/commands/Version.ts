import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { version } from "../index.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  description: "Get the sentry version",
})
export class VersionCommand extends Command {
  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    return interaction.reply({
      content: `This instance of Sentry was last built at \`${version}\``,
    });
  }
}
