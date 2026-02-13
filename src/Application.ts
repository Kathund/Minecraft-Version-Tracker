import CacheHandler from './Private/CacheHandler.js';
import DiscordManager from './Discord/DiscordManager.js';

class Application {
  readonly cacheHandler: CacheHandler;
  readonly discord: DiscordManager;
  constructor() {
    this.cacheHandler = new CacheHandler();
    this.discord = new DiscordManager(this);
  }

  async connect() {
    await this.discord.connect();
  }
}

export default Application;
