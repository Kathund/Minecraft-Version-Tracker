import { Model } from 'mongoose';
import type { MongoReturnData } from '../../Types/Mongo.js';

class BaseMongo<DataType extends Record<string, any>> {
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
    const item: DataType | null = await this.model.findOne({ [this.idField]: id });
    if (!item) return { success: false, info: 'Item not found', data: null };
    return { success: true, info: 'Item found', data: item };
  }

  async saveItem(data: DataType): Promise<MongoReturnData<DataType | null>> {
    const itemCheck = await this.getItem(data[this.idField]);
    if (itemCheck.success) return await this.updateItem(data);
    const savedItem = new this.model(data);
    await savedItem.save();
    return { success: true, info: 'Item Saved', data: savedItem };
  }

  async updateItem(data: DataType): Promise<MongoReturnData<DataType | null>> {
    const updatedData: DataType | null = await this.model.findOneAndReplace(
      { [this.idField]: data[this.idField] },
      data
    );
    return { success: true, info: 'Item Updated', data: updatedData };
  }

  async deleteItem(id: string | number): Promise<MongoReturnData<null>> {
    const result = await this.model.findOneAndDelete({ [this.idField]: id });
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
