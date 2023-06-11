import { SecretsUtility } from "../utilities/SecretsUtility.ts";
import { EmbedsUtility } from "../utilities/EmbedUtility.ts";

declare module "@sapphire/framework" {
  export interface Preconditions {
    DeveloperOnly: never;
    ServerOwnerOnly: never;
  }
}

declare module "@sapphire/plugin-utilities-store" {
  export interface Utilities {
    secrets: SecretsUtility;
    embeds: EmbedsUtility;
  }
}

export {};
