import zod from 'zod';
import { MojangPistonArtifact, type VersionType, VersionTypes } from './requests.js';

export const VersionsEntry = zod.object({
  id: zod.string(),
  type: zod.enum(VersionTypes),
  time: zod.number().positive(),
  releaseTime: zod.number().positive(),
  client: MojangPistonArtifact,
  server: MojangPistonArtifact.nullable()
});
export type VersionsEntry = zod.infer<typeof VersionsEntry>;
export type SmallVersionsEntry = Pick<VersionsEntry, 'id' | 'type' | 'releaseTime'>;
export type SQLiteVersionEntryResponse = Omit<VersionsEntry, 'client' | 'server'> & {
  client: string;
  server: string | null;
};

export interface MetadataEntry<K extends string> {
  key: K;
  value: string;
}

export const ServerEntryType = zod.object({ channel: zod.string(), role: zod.string().optional() });
export const ServerEntry = zod.object({
  id: zod.string(),
  release: ServerEntryType.nullable(),
  snapshot: ServerEntryType.nullable(),
  old_beta: ServerEntryType.nullable(),
  old_alpha: ServerEntryType.nullable()
});
export type ServerEntry = zod.infer<typeof ServerEntry>;
export type SQLiteServerEntryResponse = Omit<ServerEntry, VersionType> & Record<string, string | null>;
