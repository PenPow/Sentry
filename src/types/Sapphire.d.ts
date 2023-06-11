import { SecretsUtility } from "../utilities/SecretsUtility.ts";
import { EmbedsUtility } from "../utilities/EmbedUtility.ts";
import { ModerationUtility } from "../utilities/ModerationUtility.ts";
import { PrismaClient } from "@prisma/client";

declare module "@sapphire/framework" {
  export interface Preconditions {
    DeveloperOnly: never;
    ServerOwnerOnly: never;
  }
}

declare module "@sapphire/pieces" {
  interface Container {
    prisma: PrismaClient;
  }
}

declare module "@sapphire/plugin-utilities-store" {
  export interface Utilities {
    secrets: SecretsUtility;
    embeds: EmbedsUtility;
    moderation: ModerationUtility;
  }
}

export {}; // Changes this from a module delcaration to a module augmentation
