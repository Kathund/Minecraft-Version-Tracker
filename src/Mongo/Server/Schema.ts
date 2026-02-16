/* eslint-disable camelcase */
import { type InferSchemaType, Schema } from 'mongoose';

export const Channel = new Schema({
  channel: { type: String, required: true },
  role: { type: String }
});
export type Channel = InferSchemaType<typeof Channel>;

export const Server = new Schema({
  id: { type: String, required: true },
  release: { type: Channel },
  snapshot: { type: Channel },
  old_beta: { type: Channel },
  old_alpha: { type: Channel }
});
export type Server = InferSchemaType<typeof Server>;
