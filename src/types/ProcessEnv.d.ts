declare namespace NodeJS {
  export interface ProcessEnv {
    DOPPLER_SECRETS_KEY: string;
    NODE_ENV: "PRODUCTION" | "DEVELOPMENT";
    GIT_COMMIT: string;
  }
}
