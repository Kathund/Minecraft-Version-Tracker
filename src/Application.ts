import CacheHandler from './Private/CacheHandler.js';
import DiscordManager from './Discord/DiscordManager.js';
import MinecraftUtils from './Utils/MinecraftUtils.js';
import MongoManager from './Mongo/MongoManager.js';
import RequestHandler from './Private/Requests/RequestHandler.js';
import ScriptManager from './Scripts/ScriptManager.js';

class Application {
  readonly cacheHandler: CacheHandler;
  readonly discord: DiscordManager;
  readonly mongo: MongoManager;
  readonly requestHandler: RequestHandler;
  readonly scriptManager: ScriptManager;
  readonly minecraftUtils: MinecraftUtils;
  constructor() {
    this.cacheHandler = new CacheHandler();
    this.discord = new DiscordManager(this);
    this.mongo = new MongoManager(this);
    this.requestHandler = new RequestHandler(this);
    this.scriptManager = new ScriptManager(this);
    this.minecraftUtils = new MinecraftUtils(this);
  }

  async connect() {
    await this.mongo.connect();
    await this.discord.connect();
  }
}

export default Application;
