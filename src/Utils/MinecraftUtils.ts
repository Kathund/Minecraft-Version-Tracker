import type Application from '../Application.js';
import type { FetchedVersion, Version, VersionWithDownload } from '../Mongo/Version/Schema.js';
import type { MinecraftVersionLinks } from '../Types/Minecraft.js';

class MinecraftUtils {
  private Application: Application;
  constructor(application: Application) {
    this.Application = application;
  }

  async getMinecraftArticleData(version: Version): Promise<MinecraftVersionLinks | null> {
    const res = await this.Application.requestHandler.request(
      'https://gist.githubusercontent.com/Kathund/61625ab094cba15d0519f2ac83b4ca86/raw/MinecraftVersionMap.json'
    );
    const json: Record<string, MinecraftVersionLinks> = await res.data;
    return json[version.id] ?? null;
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
