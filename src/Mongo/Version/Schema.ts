/* eslint-disable camelcase */
import { type InferSchemaType, Schema } from 'mongoose';

export const VersionDownload = new Schema({
  sha1: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true }
});
export type VersionDownload = InferSchemaType<typeof VersionDownload>;

export const FetchedVersionDownloads = new Schema({
  client: { type: VersionDownload, required: true },
  server: { type: VersionDownload }
});
export type FetchedVersionDownloads = InferSchemaType<typeof FetchedVersionDownloads>;

export const FetchedVersion = new Schema({
  downloads: { type: FetchedVersionDownloads, required: true },
  mainClass: { type: String, required: true }
});
export type FetchedVersion = InferSchemaType<typeof FetchedVersion>;

export const Version = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['release', 'snapshot', 'old_beta', 'old_alpha'], required: true },
  url: { type: String, required: true },
  time: { type: String, required: true },
  releaseTime: { type: String, required: true },
  sha1: { type: String, required: true },
  complianceLevel: { type: Number, required: true }
});
export const VersionTypeKeys = ['release', 'snapshot', 'old_beta', 'old_alpha'] as const;
export type VersionType = (typeof VersionTypeKeys)[number];
export const VersionTypeLabels = {
  release: 'Releases',
  snapshot: 'Snapshots',
  old_beta: 'Old Beta',
  old_alpha: 'Old Alpha'
} as const;
export type Version = InferSchemaType<typeof Version>;

export const VersionWithDownload = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['release', 'snapshot', 'old_beta', 'old_alpha'], required: true },
  url: { type: String, required: true },
  time: { type: String, required: true },
  releaseTime: { type: String, required: true },
  sha1: { type: String, required: true },
  complianceLevel: { type: Number, required: true },
  client: { type: VersionDownload, required: true },
  server: { type: VersionDownload }
});
export type VersionWithDownload = InferSchemaType<typeof VersionWithDownload>;
