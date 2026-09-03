import DatabaseManager from './database/DatabaseManager.js';
import DiscordManager from './discord/DiscordManager.js';
import MinecraftVersionTrackerError from './private/error.js';
import ScriptManager from './scripts/ScriptManager.js';
import axios, { AxiosError, HttpStatusCode } from 'axios';
import packageJson from '../package.json' with { type: 'json' };
import {
  ConfirmedVersion,
  ConfirmedVersionsResponse,
  MojangPistonFullVersionResponse,
  type MojangPistonVersionResponseVersion
} from './types/requests.js';
import { type ZodType } from 'zod';
import { canSendMessages, getApplicationOwners } from './utils/discordUtils.js';
import { getErrorEmbed, getErrorTypeName } from './utils/miscUtils.js';
import type { Config } from './types/config.js';
import type { EmbedHelperField } from './types/discord.js';
import type { MinecraftArticleDataResponse } from './types/misc.js';
import type { ValidErrors } from './types/application.js';
import type { VersionsEntry } from './types/database.js';

class Application {
  readonly package: typeof packageJson = packageJson;
  readonly database: DatabaseManager;
  readonly discord: DiscordManager;
  readonly scripts: ScriptManager;
  constructor(readonly config: Config) {
    this.database = new DatabaseManager(this);
    this.discord = new DiscordManager(this);
    this.scripts = new ScriptManager(this);
  }

  async request<T>(url: string, schema: ZodType<T>): Promise<T | undefined> {
    try {
      const { data } = await axios.get(url);
      const validated = await schema.safeParseAsync(data);
      if (!validated.success) throw validated.error;
      return validated.data;
    } catch (error: unknown) {
      if (!(error instanceof AxiosError)) throw error;
      switch (error.status) {
        case HttpStatusCode.NotFound:
          return undefined;
        default:
          throw error;
      }
    }
  }

  async parseRawManifestVersion(data: MojangPistonVersionResponseVersion): Promise<VersionsEntry> {
    const fullVersionData = await this.request<MojangPistonFullVersionResponse>(
      data.url,
      MojangPistonFullVersionResponse
    );
    if (!fullVersionData) throw new MinecraftVersionTrackerError(`Could not find version data for ${data.id}`);
    return {
      id: data.id,
      type: data.type,
      time: new Date(data.time).getTime(),
      releaseTime: new Date(data.releaseTime).getTime(),
      client: {
        sha1: fullVersionData.downloads.client.sha1,
        size: fullVersionData.downloads.client.size,
        url: fullVersionData.downloads.client.url
      },
      server: fullVersionData.downloads.server
        ? {
            sha1: fullVersionData.downloads.server.sha1,
            size: fullVersionData.downloads.server.size,
            url: fullVersionData.downloads.server.url
          }
        : null
    };
  }

  async getMinecraftArticleData(version: VersionsEntry): Promise<MinecraftArticleDataResponse> {
    const res = await this.request<ConfirmedVersionsResponse>(
      'https://raw.githubusercontent.com/Kathund/Minecraft-Version-Tracker/refs/heads/main/Data/Versions.json',
      ConfirmedVersionsResponse
    );
    if (!res) throw new MinecraftVersionTrackerError(`Could not find get the article version data for ${version.id}`);
    let data: ConfirmedVersion | undefined = res[version.id] ?? undefined;
    if (data !== undefined) return { data, generated: false };

    const releaseTime = Math.floor(new Date(version.releaseTime).getTime() / 1000);
    data = {
      article: this.generateMinecraftArticleURL(version),
      wiki: `https://minecraft.wiki/w/Java_Edition_${version.id.replaceAll('a1.', 'Alpha_1.').replaceAll('b1.', 'Beta_1.')}`,
      source:
        releaseTime >= 1765888949
          ? `https://mcsrc.dev/1/${version.id.replaceAll(' ', '_')}/net/minecraft/client/main/Main`
          : null
    };
    return { data, generated: true };
  }

  private generateMinecraftArticleURL(version: VersionsEntry): string | null {
    const releaseTime = Math.floor(version.releaseTime / 1000);
    const formattedId = version.id.replaceAll('.', '-');
    const basePath = 'https://www.minecraft.net/en-us/article/minecraft-';

    switch (version.type) {
      case 'release': {
        // 1695200577 - 1.20.2
        if (releaseTime <= 1695200577) return null;
        return `${basePath}java-edition-${formattedId}`;
      }
      case 'snapshot': {
        // 1481812732 - 16w50a
        if (releaseTime <= 1481812732) return null;
        let path: string = '';

        // 1765888949 - 26.1-snapshot-1
        if (releaseTime >= 1765888949) {
          path = formattedId;
        } else if (releaseTime >= 1481812732) {
          // 1481812732 - 16w50a
          path = `snapshot-${formattedId}`;
        }

        if (version.id.includes('-rc')) {
          path = formattedId.replaceAll('-rc', '-release-candidate');
        } else if (version.id.includes('-pre')) {
          path = formattedId.replaceAll('-pre', '-pre-release');
        }

        if (!path) return null;
        return `${basePath}${path}`;
      }
      default: {
        return null;
      }
    }
  }
  async logError(error: ValidErrors, extraData: EmbedHelperField[] = []) {
    console.error(error);
    if (!this.discord.isClientOnline()) return;

    try {
      if (!this.config.logger.errorLogChannel) return;
      const channel = await this.discord.client.channels.fetch(this.config.logger.errorLogChannel);
      if (channel === null || !channel.isSendable()) {
        throw new MinecraftVersionTrackerError('Error logs channel could not be found');
      }
      const hasPermission = await canSendMessages(channel);
      if (!hasPermission) return;
      const owners = await getApplicationOwners(this.discord.client);
      await channel.send({
        content: getErrorTypeName(error) === 'Generic Error' ? owners.map((id) => `<@${id}>`).join(' ') : '',
        embeds: [getErrorEmbed(error, extraData)]
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export default Application;
