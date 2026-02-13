/* eslint-disable require-await */
import { Model } from 'mongoose';
import type { MongoReturnData } from '../../Types/Mongo.js';

class BaseMongo<DataType> {
  declare model: typeof Model;
  declare idField: string;
  constructor(model: typeof Model, idField: string = 'id') {
    this.model = model;
    this.idField = idField;
  }

  async getItems(): Promise<MongoReturnData<DataType[]>> {
    const items: DataType[] = await this.model.find();
    if (!items) return { success: false, info: 'Items not found', data: [] };
    return { success: true, info: 'Item found', data: items };
  }

  async getItem(id: string | number): Promise<MongoReturnData<DataType | null>> {
    const item: DataType | null = await this.model.findOne({ id });
    if (!item) return { success: false, info: 'Item not found', data: null };
    return { success: true, info: 'Item found', data: item };
  }

  async saveItem(data: DataType): Promise<MongoReturnData<DataType | null>> {
    throw new Error('Execute Method not implemented!');
  }

  async updateItem(newData: DataType): Promise<MongoReturnData<DataType | null>> {
    throw new Error('Execute Method not implemented!');
  }

  async deleteItem(id: string | number): Promise<MongoReturnData<null>> {
    const result = await this.model.findOneAndDelete({ id });
    if (!result) return { success: false, info: 'Item not found', data: null };
    return { success: true, info: 'Item Deleted', data: null };
  }

  async getRandomItem(): Promise<MongoReturnData<DataType>> {
    const [randomItem] = await this.model.aggregate([{ $sample: { size: 1 } }]);
    return { success: true, info: 'Item found', data: randomItem };
  }

  async getSize(): Promise<number> {
    const items = await this.getItems();
    return items.success ? items.data.length : 0;
  }
}

export default BaseMongo;
