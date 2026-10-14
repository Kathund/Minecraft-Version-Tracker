import DatabaseManager from './database/DatabaseManager.ts';
import DiscordManager from './discord/DiscordManager.ts';
import MinecraftVersionTrackerError from './private/error.ts';
import ScriptManager from './scripts/ScriptManager.ts';
import axios, { AxiosError, AxiosHeaders, type AxiosRequestConfig, HttpStatusCode } from 'axios';
import packageJson from '../package.json' with { type: 'json' };
import {
  ConfirmedVersion,
  ConfirmedVersionsResponse,
  MojangPistonFullVersionResponse,
  type MojangPistonVersionResponseVersion
} from './types/requests.ts';
import { type ZodType } from 'zod';
import { canSendMessages, getApplicationOwners } from './utils/discordUtils.ts';
import { execSync } from 'node:child_process';
import { getErrorEmbed, getErrorTypeName, toError } from './utils/miscUtils.ts';
import type { Config } from './types/config.ts';
import type { EmbedHelperField } from './types/discord.ts';
import type { MinecraftArticleDataResponse } from './types/misc.ts';
import type { RuntimeInformation, ValidErrors } from './types/application.ts';
import type { VersionsEntry } from './types/database.ts';

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

  async request<T>(url: string, schema: ZodType<T>, config: AxiosRequestConfig = {}): Promise<T | undefined> {
    try {
      const headers = new AxiosHeaders(config.headers as AxiosHeaders | undefined);
      if (!headers.has('User-Agent')) headers.set('User-Agent', this.getUserAgent());
      const { data } = await axios.get(url, { ...config, headers });
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

  private getGitCommit(): RuntimeInformation['commit'] {
    try {
      return process.env.GIT_COMMIT ?? execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      this.logError(toError(error));
      return 'UNKNOWN';
    }
  }

  private getGitDirty(): RuntimeInformation['dirty'] {
    try {
      return process.env.GIT_DIRTY !== undefined
        ? process.env.GIT_DIRTY === 'true'
        : execSync('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;
    } catch (error) {
      this.logError(toError(error));
      return false;
    }
  }

  getRuntimeInformation(): RuntimeInformation {
    return { commit: this.getGitCommit(), dirty: this.getGitDirty(), docker: process.env.RUNNING_IN_DOCKER === 'true' };
  }

  getUserAgent() {
    const runtime = this.getRuntimeInformation();
    return `${this.package.name}/v${this.package.version}/g${runtime.commit} (github:Kathund/Minecraft-Version-Tracker)`;
  }
}

export default Application;
