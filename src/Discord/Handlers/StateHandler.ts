import type DiscordManager from '../DiscordManager.js';

class StateHandler {
  private readonly discord: DiscordManager;
  constructor(discordManager: DiscordManager) {
    this.discord = discordManager;
  }

  async onReady() {
    if (!this.discord.client || !this.discord.client.user) return;
    console.discord(`Logged in as ${this.discord.client.user?.username} (${this.discord.client.user?.id})!`);
    await this.discord.buttonHandler.loadButtons();

    console.discord('Client fully loaded');
  }
}

export default StateHandler;
