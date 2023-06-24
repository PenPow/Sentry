/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { SecretsUtility } from "../utilities/SecretsUtility.ts";
import { EmbedsUtility } from "../utilities/EmbedUtility.ts";
import { ModerationUtility } from "../utilities/ModerationUtility.ts";
import { PhishingUtility } from "../utilities/PhishingUtility.ts";
import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";

declare module "@sapphire/framework" {
  export interface Preconditions {
    DeveloperOnly: never;
    ServerOwnerOnly: never;
    ClientNeedsModerationPrivileges: never;
  }
}

declare module "@sapphire/pieces" {
  interface Container {
    prisma: PrismaClient;
    redis: Redis;
  }
}

declare module "@sapphire/plugin-utilities-store" {
  export interface Utilities {
    secrets: SecretsUtility;
    embeds: EmbedsUtility;
    moderation: ModerationUtility;
    phishing: PhishingUtility;
  }
}

declare module "@sapphire/plugin-scheduled-tasks" {
  interface ScheduledTasks {
    expiringCase: never;
  }
}

export {}; // turns Sapphire.d.ts into a module augmentation as opposed to a module declaration
