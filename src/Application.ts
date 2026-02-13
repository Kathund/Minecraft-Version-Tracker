import CacheHandler from './Private/CacheHandler.js';
import DiscordManager from './Discord/DiscordManager.js';
import MongoManager from './Mongo/MongoManager.js';

class Application {
  readonly cacheHandler: CacheHandler;
  readonly discord: DiscordManager;
  readonly mongo: MongoManager;
  constructor() {
    this.cacheHandler = new CacheHandler();
    this.discord = new DiscordManager(this);
    this.mongo = new MongoManager(this);
  }

  async connect() {
    await this.mongo.connect();
    await this.discord.connect();
  }
}

export default Application;
