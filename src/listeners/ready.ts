import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { RewriteFrames } from "@sentry/integrations";

import * as Sentry from "@sentry/node";
import { version } from "../index.js";

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyEvent extends Listener {
  public async run() {
    await this.container.utilities.secrets.init();
    Sentry.init({
      dsn: this.container.utilities.secrets.get("SENTRY_DSN")!,
      release: version,
      enabled: process.env.NODE_ENV === "PRODUCTION",
      environment: process.env.NODE_ENV.toLowerCase(),
      integrations: [
        new Sentry.Integrations.Console(),
        new Sentry.Integrations.FunctionToString(),
        new Sentry.Integrations.LinkedErrors(),
        new Sentry.Integrations.Modules(),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection(),
        new RewriteFrames({ root: "/usr/sentry/dist", prefix: "src/" }),
      ],
    });

    this.container.logger.info("Ready!");
  }
}
