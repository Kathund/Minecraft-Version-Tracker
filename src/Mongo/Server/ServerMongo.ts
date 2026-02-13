import BaseMongo from '../Private/BaseMongo.js';
import { Server } from './Schema.js';
import { model } from 'mongoose';
import type { MongoReturnData } from '../../Types/Mongo.js';

class ServerMongo extends BaseMongo<Server> {
  constructor() {
    super(model('server', Server));
  }

  override async saveItem(data: Server): Promise<MongoReturnData<Server | null>> {
    const itemCheck = await this.getItem(data.id);
    if (itemCheck.success) return await this.updateItem(data);
    const savedItem = new this.model(data);
    await savedItem.save();
    return { success: true, info: 'Item Saved', data: savedItem };
  }

  override async updateItem(version: Server): Promise<MongoReturnData<null>> {
    await this.model.findOneAndReplace({ id: version.id }, version);
    return { success: true, info: 'Item Updated', data: null };
  }
}

export default ServerMongo;
