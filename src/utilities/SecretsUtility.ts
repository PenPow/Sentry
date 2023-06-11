import { Utility } from "@sapphire/plugin-utilities-store";

let obtainedToken = false;

export async function getToken(): Promise<string> {
  if (obtainedToken) throw new Error("Token can only be obtained once");
  const res = await fetch(`https://api.doppler.com/v3/configs/config/secrets/download?format=json`, {
    headers: {
      authorization: `Bearer ${process.env.DOPPLER_SECRETS_KEY}`,
    },
  });

  const secrets: Record<string, string> = await res.json();

  obtainedToken = true;

  return secrets["DISCORD_TOKEN"]!;
}

export class SecretsUtility extends Utility {
  private initialised: boolean;
  #secrets!: Record<string, string>;

  public constructor(context: Utility.Context, options: Utility.Options) {
    super(context, {
      ...options,
      name: "secrets",
    });

    this.initialised = false;

    void this.init();
  }

  public async init() {
    if (this.initialised) return;

    const res = await fetch(`https://api.doppler.com/v3/configs/config/secrets/download?format=json`, {
      headers: {
        authorization: `Bearer ${process.env.DOPPLER_SECRETS_KEY}`,
      },
    });

    this.#secrets = await res.json();

    this.initialised = true;
  }

  public async get(key: string): Promise<string | undefined> {
    if (!this.initialised) {
      await this.init();
    }

    return this.#secrets[key];
  }
}
