import BaseMongo from '../Private/BaseMongo.js';
import { VersionWithDownload } from './Schema.js';
import { model } from 'mongoose';
import type MongoManager from '../MongoManager.js';
import type { MongoReturnData } from '../../Types/Mongo.js';

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

  override async saveItem(data: VersionWithDownload): Promise<MongoReturnData<VersionWithDownload | null>> {
    const itemCheck = await this.getItem(data.id);
    if (itemCheck.success) return await this.updateItem(data);
    const savedItem = new this.model(data);
    await savedItem.save();
    return { success: true, info: 'Item Saved', data: savedItem };
  }

  override async updateItem(version: VersionWithDownload): Promise<MongoReturnData<null>> {
    await this.model.findOneAndReplace({ id: version.id }, version);
    return { success: true, info: 'Item Updated', data: null };
  }
}

export default VersionMongo;
