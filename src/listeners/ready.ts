import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyEvent extends Listener {
  public run() {
    this.container.logger.info("Ready!");
  }
}
