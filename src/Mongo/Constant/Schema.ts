import { FetchedVersions } from '../Version/Schema.js';
import { type InferSchemaType, Schema } from 'mongoose';

export const Constant = new Schema({
  id: { type: String, required: true },
  lastUpdatedMinecraftVersion: { type: Number, required: true },
  minecraftVersions: { type: FetchedVersions, required: true }
});
export type Constant = InferSchemaType<typeof Constant>;
