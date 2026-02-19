import CacheHandler from './Private/CacheHandler.js';
import DiscordManager from './Discord/DiscordManager.js';
import MinecraftUtils from './Utils/MinecraftUtils.js';
import MongoManager from './Mongo/MongoManager.js';
import RequestHandler from './Private/Requests/RequestHandler.js';
import ScriptManager from './Scripts/ScriptManager.js';

class Application {
  readonly cacheHandler: CacheHandler;
  readonly requestHandler: RequestHandler;
  readonly minecraftUtils: MinecraftUtils;
  readonly mongo: MongoManager;
  readonly scriptManager: ScriptManager;
  readonly discord: DiscordManager;
  constructor() {
    this.cacheHandler = new CacheHandler();
    this.requestHandler = new RequestHandler(this);
    this.minecraftUtils = new MinecraftUtils(this);
    this.mongo = new MongoManager(this);
    this.scriptManager = new ScriptManager(this);
    this.discord = new DiscordManager(this);
  }

  async connect() {
    await this.mongo.connect();
    await this.discord.connect();
  }
}

export default Application;
