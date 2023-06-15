import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyEvent extends Listener {
  public run() {
    await this.container.utilities.secrets.init();
    this.container.logger.info("Ready!");
  }
}
