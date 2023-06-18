import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { RewriteFrames } from "@sentry/integrations";
import { PrismaClient } from "@prisma/client";
import { version } from "../index.js";

import * as Sentry from "@sentry/node";
import { fieldEncryptionMiddleware } from "prisma-field-encryption";
import { Redis } from "ioredis";
import { setTimeout } from "timers/promises";

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyEvent extends Listener {
  public async run() {
    await setTimeout(200); // Resolves weird issue where secrets havent been initialised yet

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

    this.container.prisma = new PrismaClient({
      datasources: {
        db: {
          url: "postgresql://postgres:postgres@db:5432/sentry?schema=public",
        },
      },
    });

    this.container.redis = new Redis(6379, "redis");

    this.container.prisma.$use(fieldEncryptionMiddleware({ encryptionKey: this.container.utilities.secrets.get("DB_ENCRYPTION_KEY")! }));

    this.container.logger.info("Ready!");
  }
}
