import Database from 'better-sqlite3';
import MinecraftVersionTrackerError from '../private/error.js';
import {
  type MetadataEntry,
  type SQLiteServerEntryResponse,
  type SQLiteVersionEntryResponse,
  ServerEntry,
  type SmallVersionsEntry,
  VersionsEntry
} from '../types/database.js';
import { access, readFile } from 'node:fs/promises';
import { range } from 'discord.js';
import type Application from '../Application.js';
import type { VersionType } from '../types/requests.js';

class DatabaseManager {
  static readonly CURRENT_DB_SCHEMA_VERSION: number = 2;
  private readonly db: Database.Database;
  constructor(readonly application: Application) {
    this.db = new Database(this.application.config.other.sqlitedb);
  }

  async checkForDatabase() {
    const metadataTable = this.db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'metadata'")
      .get();
    if (!metadataTable) {
      console.other('I have no database! I am probably new.');
      console.other(`Will set up ${this.application.config.other.sqlitedb}`);
      this.initNewDB();
    }

    await access(this.application.config.other.sqlitedb);
  }

  private initNewDB() {
    this.db.exec(`CREATE TABLE metadata(
        key TEXT PRIMARY KEY,
        value TEXT
    ) STRICT`);

    this.insertMetadataEntry<'SchemaVersion'>({ key: 'SchemaVersion', value: '0' });
  }

  async checkForMigrations() {
    console.other('Checking whether DB needs migrations...');

    let dbversion;
    try {
      const version = this.getMetadataEntry('SchemaVersion');
      if (!version) {
        console.error('Metadata table has no SchemaVersion. DB Version is 0 and applying all migrations.');
        dbversion = 0;
      } else {
        dbversion = Number.parseInt(version.value);
      }
    } catch (e) {
      console.error(e);
      console.error('There is likely no metadata table. Assuming our DB Version is 0 and applying all migrations.');
      dbversion = 0;
    }

    if (dbversion === DatabaseManager.CURRENT_DB_SCHEMA_VERSION) return;

    const migrationFiles: string[] = [];

    for (const m of range({ start: dbversion + 1, end: DatabaseManager.CURRENT_DB_SCHEMA_VERSION + 1 })) {
      try {
        await access(`src/database/migrations/${m - 1}-${m}.sql`);
      } catch {
        console.error(
          `A needed database migration (src/database/migrations/${m - 1}-${m}.sql) does not exist. It is not safe to continue.`
        );
        process.exit(1);
      }

      migrationFiles.push(`src/database/migrations/${m - 1}-${m}.sql`);
    }

    for (const migration of migrationFiles) {
      console.other(`Applying database migration ${migration}...`);
      await this.doDatabaseMigration(migration);
    }

    console.other('Done with migrations. Setting SchemaVersion to new value...');
    this.updateMetadataEntry<'SchemaVersion'>({
      key: 'SchemaVersion',
      value: DatabaseManager.CURRENT_DB_SCHEMA_VERSION.toString()
    });
  }

  private async doDatabaseMigration(file: string) {
    const data = await readFile(file);
    if (!data) throw new Error(`The ${file} file does not exist.`);
    this.db.exec(data.toString('utf-8'));
  }

  getMetadataEntry<K extends string>(key: K): MetadataEntry<K> | null {
    return this.db.prepare<string, MetadataEntry<K>>('SELECT * FROM metadata WHERE key = ?').get(key) ?? null;
  }

  updateMetadataEntry<K extends string>(entry: MetadataEntry<K>) {
    this.db.prepare<MetadataEntry<K>>('UPDATE metadata SET value = @value WHERE key = @key').run(entry);
  }

  private insertMetadataEntry<K extends string>(entry: MetadataEntry<K>) {
    this.db.prepare<MetadataEntry<K>>('INSERT INTO metadata(key, value) VALUES (@key, @value)').run(entry);
  }

  async getVersion(id: VersionsEntry['id']): Promise<VersionsEntry | undefined> {
    const data = this.db
      .prepare<[VersionsEntry['id']], SQLiteVersionEntryResponse>('SELECT * FROM versions WHERE id = ?')
      .get(id);

    if (!data) return undefined;

    const parsed = await VersionsEntry.safeParseAsync({
      ...data,
      client: JSON.parse(data.client),
      server: data.server ? JSON.parse(data.server) : null
    });
    if (!parsed.success) throw new MinecraftVersionTrackerError(`Invalid version data for id ${id} | ${parsed.error}`);
    return parsed.data;
  }

  async insertVersion(data: VersionsEntry): Promise<void> {
    const validated = await VersionsEntry.safeParseAsync(data);
    if (!validated.success) throw validated.error;
    this.db
      .prepare(
        'INSERT INTO versions (id, type, time, releaseTime, client, server) VALUES (@id, @type, @time, @releaseTime, @client, @server)'
      )
      .run({
        ...validated.data,
        client: JSON.stringify(validated.data.client),
        server: validated.data.server ? JSON.stringify(validated.data.server) : null
      });
  }

  getVersionIds(): VersionsEntry['id'][] {
    return this.db
      .prepare<[], Pick<VersionsEntry, 'id'>>('SELECT id FROM versions ORDER BY releaseTime DESC')
      .all()
      .map((row) => row.id);
  }

  getVersions(filter: string = '', limit: number = -1): SmallVersionsEntry[] {
    return this.db
      .prepare<[string, number], SmallVersionsEntry>(
        'SELECT id, type, releaseTime FROM versions WHERE id LIKE ? ORDER BY releaseTime DESC LIMIT ?'
      )
      .all(`${filter}%`, limit);
  }

  async getLatestVersionByType(type: VersionType): Promise<VersionsEntry | undefined> {
    const data = this.db
      .prepare<[VersionType], SQLiteVersionEntryResponse>(
        'SELECT * FROM versions WHERE type = ? ORDER BY releaseTime DESC LIMIT 1'
      )
      .get(type);
    if (!data) return undefined;

    const parsed = await VersionsEntry.safeParseAsync({
      ...data,
      client: JSON.parse(data.client),
      server: data.server ? JSON.parse(data.server) : null
    });
    if (!parsed.success) {
      throw new MinecraftVersionTrackerError(`Invalid version data for id ${data.id} | ${parsed.error}`);
    }
    return parsed.data;
  }

  async getLatestVersionIdByType(type: VersionType): Promise<VersionsEntry['id'] | undefined> {
    const data = await this.getLatestVersionByType(type);
    return data?.id;
  }

  async getServer(id: ServerEntry['id']): Promise<ServerEntry | undefined> {
    const data = this.db
      .prepare<[ServerEntry['id']], SQLiteServerEntryResponse>('SELECT * FROM servers WHERE id = ?')
      .get(id);
    if (!data) return undefined;
    const parsed = await ServerEntry.safeParseAsync({
      ...data,
      release: data.release ? JSON.parse(data.release) : null,
      snapshot: data.snapshot ? JSON.parse(data.snapshot) : null,
      old_beta: data.old_beta ? JSON.parse(data.old_beta) : null,
      old_alpha: data.old_alpha ? JSON.parse(data.old_alpha) : null
    });
    if (!parsed.success) throw new MinecraftVersionTrackerError(`Invalid server data for id ${id} | ${parsed.error}`);
    return parsed.data;
  }

  async updateServer(data: ServerEntry): Promise<void> {
    const validated = await ServerEntry.safeParseAsync(data);
    if (!validated.success) throw validated.error;
    this.db
      .prepare(
        'INSERT INTO servers (id, release, snapshot, old_beta, old_alpha) VALUES (@id, @release, @snapshot, @old_beta, @old_alpha) ON CONFLICT(id) DO UPDATE SET release = excluded.release, snapshot = excluded.snapshot, old_beta = excluded.old_beta, old_alpha = excluded.old_alpha'
      )
      .run({
        id: validated.data.id,
        release: validated.data.release ? JSON.stringify(validated.data.release) : null,
        snapshot: validated.data.snapshot ? JSON.stringify(validated.data.snapshot) : null,
        old_beta: validated.data.old_beta ? JSON.stringify(validated.data.old_beta) : null,
        old_alpha: validated.data.old_alpha ? JSON.stringify(validated.data.old_alpha) : null
      });
  }

  async getServersWithType(type: VersionType): Promise<ServerEntry[]> {
    const servers = this.db
      .prepare<[VersionType], SQLiteServerEntryResponse>('SELECT * FROM servers WHERE ? IS NOT NULL')
      .all(type);
    const parsedServers = [];
    for (const data of servers) {
      const parsed = await ServerEntry.safeParseAsync({
        ...data,
        release: data.release ? JSON.parse(data.release) : null,
        snapshot: data.snapshot ? JSON.parse(data.snapshot) : null,
        old_beta: data.old_beta ? JSON.parse(data.old_beta) : null,
        old_alpha: data.old_alpha ? JSON.parse(data.old_alpha) : null
      });
      if (!parsed.success) {
        throw new MinecraftVersionTrackerError(`Invalid server data for id ${data.id} | ${parsed.error}`);
      }
      parsedServers.push(parsed.data);
    }
    return parsedServers;
  }
}

export default DatabaseManager;
