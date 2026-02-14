import ServerMongo from './Server/ServerMongo.js';
import VersionMongo from './Version/VersionMongo.js';
import { connect } from 'mongoose';
import type Application from '../Application.js';

class MongoManager {
  readonly Application: Application;
  readonly server: ServerMongo;
  readonly version: VersionMongo;
  constructor(app: Application) {
    this.Application = app;
    this.server = new ServerMongo();
    this.version = new VersionMongo(this);
  }

  async connect() {
    if (process.env.MONGO_URL === undefined) throw new Error('Missing mongo db URL');
    await connect(process.env.MONGO_URL).then(() => console.other('Mongo Connected'));
  }
}

export default MongoManager;
