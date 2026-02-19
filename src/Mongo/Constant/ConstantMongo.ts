import BaseMongo from '../Private/BaseMongo.js';
import { Constant } from './Schema.js';
import { model } from 'mongoose';
import type MongoManager from '../MongoManager.js';
import type { MongoReturnData } from '../../Types/Mongo.js';

class ConstantMongo extends BaseMongo<Constant> {
  readonly mongo: MongoManager;
  constructor(mongo: MongoManager) {
    super(model('constant', Constant));
    this.mongo = mongo;
    this.mongo.Application.minecraftUtils.getVersions();
  }

  async get(): Promise<MongoReturnData<Constant | null>> {
    return await this.getItem('const');
  }
}

export default ConstantMongo;
