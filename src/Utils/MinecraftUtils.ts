import type Application from '../Application.js';
import type { FetchedVersion, FetchedVersions, Version, VersionWithDownload } from '../Mongo/Version/Schema.js';
import type { MinecraftArticleData, MinecraftArticleDataResponse } from '../Types/Minecraft.js';

class MinecraftUtils {
  private Application: Application;
  constructor(application: Application) {
    this.Application = application;
  }

  async getVersions(): Promise<Version[]> {
    const res = await this.Application.requestHandler.request(
      'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json',
      { noCache: true, parse: false }
    );
    const constantData = await this.Application.mongo.constant.get();
    if (!constantData.success || constantData.data === null) {
      const lastUpdatedHeader = res.headers.get('last-modified');
      const minecraftVersions: FetchedVersions = JSON.parse(new TextDecoder().decode(res.data));
      await this.Application.mongo.constant.saveItem({
        id: 'const',
        lastUpdatedMinecraftVersion: new Date(lastUpdatedHeader || new Date().getTime()).getTime(),
        minecraftVersions
      });
      return minecraftVersions.versions;
    }
    return constantData.data.minecraftVersions.versions;
  }

  async getMinecraftArticleData(version: Version): Promise<MinecraftArticleDataResponse> {
    const res = await this.Application.requestHandler.request(
      'https://raw.githubusercontent.com/Kathund/Minecraft-Version-Tracker/refs/heads/main/Data/Versions.json'
    );
    const json: Record<string, MinecraftArticleData> = await res.data;
    let data: MinecraftArticleData | undefined = json[version.id] ?? undefined;

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

  private generateMinecraftArticleURL(version: Version): string | null {
    const releaseTime = Math.floor(new Date(version.releaseTime).getTime() / 1000);
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
          path = formattedId.replaceAll('-rc', '-release-candidate-');
        } else if (version.id.includes('-pre')) {
          path = formattedId.replaceAll('-pre', '-pre-release-');
        }

        if (!path) return null;
        return `${basePath}${path}`;
      }
      default: {
        return null;
      }
    }
  }

  async convertVersion(version: Version): Promise<VersionWithDownload> {
    const fetchedVersion = await this.Application.requestHandler.request(version.url);
    const fetchedVersionData: FetchedVersion = fetchedVersion.data;
    return {
      id: version.id,
      type: version.type,
      url: version.url,
      time: version.time,
      releaseTime: version.releaseTime,
      sha1: version.sha1,
      complianceLevel: version.complianceLevel,
      client: {
        sha1: fetchedVersionData.downloads.client.sha1,
        size: fetchedVersionData.downloads.client.size,
        url: fetchedVersionData.downloads.client.url
      },
      server: fetchedVersionData.downloads.server
        ? {
            sha1: fetchedVersionData.downloads.server.sha1,
            size: fetchedVersionData.downloads.server.size,
            url: fetchedVersionData.downloads.server.url
          }
        : undefined
    };
  }
}

export default MinecraftUtils;
