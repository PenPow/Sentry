import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes, Result, UserError } from "@sapphire/framework";
import { Stopwatch } from "@sapphire/stopwatch";
import { isNullish, isThenable } from "@sapphire/utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalSubmitInteraction } from "discord.js";
import { inspect } from "util";
import { version } from "../../index.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class ModalHandler extends InteractionHandler {
  public override parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("eval")) return this.none();

    return this.some({ code: interaction.fields.getTextInputValue("code"), async: Boolean(interaction.customId.split("|").slice(1)) });
  }

  public override async run(interaction: ModalSubmitInteraction, parameters: InteractionHandler.ParseResult<this>) {
    if (isNullish(parameters.code)) {
      throw new UserError({
        identifier: "InvalidArguments",
        message: "No code provided to evalulate",
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const result = await this.eval(parameters);
    const data = result.intoOkOrErr();

    const components = [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(data.paste).setEmoji("🔗").setLabel("Output")
      ),
    ];

    return interaction.editReply({
      components,
      content: [
        `⏱️ **Execution Time:** \`${data.executionTime}\``,
        `\nSentry Commit [${version.slice(0, 7)}](https://github.com/PenPow/Sentry/tree/${version})\n`,
        result.isOk() ? "❓ Code excecuted successfully" : "❓ Code returned an error",
      ].join("\n"),
    });
  }

  private async eval(
    parameters: InteractionHandler.ParseResult<this>
  ): Promise<Result<{ executionTime: string; paste: string }, { executionTime: string; paste: string }>> {
    let { code } = parameters;

    const runtimeStopwatch: Stopwatch = new Stopwatch();

    let result;

    try {
      if (parameters.async) {
        code = `(async () => {\n${parameters.code
          .split("\n")
          .map((line) => `   ${line}`)
          .join("\n")}\n})();`;
      }

      runtimeStopwatch.restart();
      // eslint-disable-next-line no-eval
      result = eval(code);
      runtimeStopwatch.stop();

      if (isThenable(result)) {
        runtimeStopwatch.start();

        result = await result;

        runtimeStopwatch.stop();
      }

      return Result.ok({
        executionTime: runtimeStopwatch.toString(),
        paste: await this.makePaste(result),
      });
    } catch (err) {
      runtimeStopwatch.stop();

      const response = result instanceof Error ? result.stack! : inspect(result, { depth: 10, showHidden: true });

      return Result.err({
        executionTime: runtimeStopwatch.toString(),
        paste: await this.makePaste(response),
      });
    }
  }

  private async makePaste(result: string) {
    const response = await fetch("https://hastebin.skyra.pw/documents", { method: "POST", body: result });

    const { key } = (await response.json()) as { key: string };

    return `https://hastebin.skyra.pw/${key}.js`;
  }
}
