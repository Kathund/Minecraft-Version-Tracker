import BaseMongo from '../Private/BaseMongo.js';
import { VersionWithDownload } from './Schema.js';
import { model } from 'mongoose';
import type MongoManager from '../MongoManager.js';

class VersionMongo extends BaseMongo<VersionWithDownload> {
  readonly mongo: MongoManager;
  constructor(mongo: MongoManager) {
    super(model('version', VersionWithDownload));
    this.mongo = mongo;
    this.init();
  }

  private async init() {
    const size = await this.getSize();
    if (size === 0) await this.mongo.Application.scriptManager.loadVersions.execute();
  }
}

export default VersionMongo;
