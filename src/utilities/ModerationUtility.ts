import { Utility } from "@sapphire/plugin-utilities-store";

export class ModerationUtility extends Utility {
  public constructor(context: Utility.Context, options: Utility.Options) {
    super(context, {
      ...options,
      name: "moderation",
    });
  }

  //   public upsertCase() {}

  //   public createCaseEmbed() {}
}
