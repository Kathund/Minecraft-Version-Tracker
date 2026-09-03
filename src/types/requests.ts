import zod from 'zod';

export const VersionTypes = ['release', 'snapshot', 'old_beta', 'old_alpha'] as const;
export type VersionType = (typeof VersionTypes)[number];
export function isVersionType(value: string): value is VersionType {
  return (VersionTypes as readonly string[]).includes(value);
}

export const MojangPistonArtifact = zod.object({
  sha1: zod.string(),
  size: zod.number().positive(),
  url: zod.string()
});
export type MojangPistonArtifact = zod.infer<typeof MojangPistonArtifact>;

export const MojangPistonVersionResponseLatest = zod.object({ release: zod.string(), snapshot: zod.string() });
// WARNING! This is a narrowed down version. There is more data but for this project it's not needed and ignored
export const MojangPistonVersionResponseVersion = zod.object({
  id: zod.string(),
  type: zod.enum(VersionTypes),
  url: zod.string(),
  time: zod.string(),
  releaseTime: zod.string()
});
export type MojangPistonVersionResponseVersion = zod.infer<typeof MojangPistonVersionResponseVersion>;
export const MojangPistonVersionResponse = zod.object({
  latest: MojangPistonVersionResponseLatest,
  versions: zod.array(MojangPistonVersionResponseVersion)
});
export type MojangPistonVersionResponse = zod.infer<typeof MojangPistonVersionResponse>;

export const MojangPistonFullVersionResponseDownloads = zod.object({
  client: MojangPistonArtifact,
  server: MojangPistonArtifact.optional()
});
// WARNING! This is a narrowed down version. There is more data but for this project it's not needed and ignored
export const MojangPistonFullVersionResponse = zod.object({
  downloads: MojangPistonFullVersionResponseDownloads,
  id: zod.string(),
  mainClass: zod.string(),
  releaseTime: zod.string(),
  time: zod.string(),
  type: zod.enum(VersionTypes)
});
export type MojangPistonFullVersionResponse = zod.infer<typeof MojangPistonFullVersionResponse>;

export const ConfirmedVersion = zod.object({
  article: zod.string().nullable(),
  wiki: zod.string(),
  source: zod.string().nullable()
});
export type ConfirmedVersion = zod.infer<typeof ConfirmedVersion>;
export const ConfirmedVersionsResponse = zod.record(zod.string(), ConfirmedVersion);
export type ConfirmedVersionsResponse = zod.infer<typeof ConfirmedVersionsResponse>;
