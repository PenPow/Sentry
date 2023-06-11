import { PrismaClient } from "@prisma/client";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { fieldEncryptionMiddleware } from "prisma-field-encryption";

@ApplyOptions<Listener.Options>({ once: true })
export class ReadyEvent extends Listener {
  public async run() {
    this.container.prisma = new PrismaClient({
      datasources: {
        db: {
          url: "postgresql://postgres:postgres@db:5432/mydb?schema=public",
        },
      },
    });

    this.container.prisma.$use(
      fieldEncryptionMiddleware({
        encryptionKey: (await this.container.utilities.secrets.get("DB_ENCRYPTION_KEY"))!,
      })
    );

    this.container.logger.info("Ready!");
  }
}
