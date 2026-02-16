import BaseMongo from '../Private/BaseMongo.js';
import { Server } from './Schema.js';
import { model } from 'mongoose';

class ServerMongo extends BaseMongo<Server> {
  constructor() {
    super(model('server', Server));
  }
}

export default ServerMongo;
