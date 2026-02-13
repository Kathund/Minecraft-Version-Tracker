declare namespace NodeJS {
  interface ProcessEnv {
    DISCORD_TOKEN: string;
    DISCORD_LOGS_CHANNEL: string;
    MONGO_URL: string;
  }
}
