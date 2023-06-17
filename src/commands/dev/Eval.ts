import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ModalBuilder, TextInputStyle, ActionRowBuilder, TextInputBuilder } from "discord.js";

@ApplyOptions<Command.Options>({
  description: "Interactive debugger",
  preconditions: ["DeveloperOnly"],
})
export class EvalCommand extends Command {
  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addBooleanOption((option) => option.setName("async").setDescription("Should this be executed asynchronously (default false)")),
      { guildIds: ["893846199063445514"] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId(`eval|${interaction.options.getBoolean("async") ?? false}`)
      .setTitle("Enter Code to Evaluate")
      .setComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder().setCustomId("code").setStyle(TextInputStyle.Paragraph).setLabel("What code to evaluate?")
        )
      );

    return interaction.showModal(modal);
  }
}
