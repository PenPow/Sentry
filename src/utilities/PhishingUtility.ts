import { Utility } from "@sapphire/plugin-utilities-store";
import { Time } from "@sapphire/time-utilities";

export class PhishingUtility extends Utility {
  #domains: string[];

  public constructor(context: Utility.Context, options: Utility.Options) {
    super(context, {
      ...options,
      name: "phishing",
    });

    this.#domains = [];

    void this.refresh();

    setTimeout(() => this.refresh(), Time.Hour);
  }

  public async refresh() {
    const res = await fetch(`https://phish.sinking.yachts/v2/all`, {
      headers: {
        "X-Identity": `Sentry Discord Bot (https://github.com/PenPow/Sentry)`,
      },
    });

    this.#domains = await res.json();
    this.#domains.push("phish-test.com");
  }

  public check(domain: string): boolean {
    return this.#domains.includes(domain);
  }
}
