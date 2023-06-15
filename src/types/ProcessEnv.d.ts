declare namespace NodeJS {
  export interface ProcessEnv {
    DOPPLER_SECRETS_KEY: string;
    GIT_COMMIT: string;
  }
}
