import Script from '../Private/Script.js';
import type { FetchedVersion, Version } from '../../Mongo/Version/Schema.js';

class LoadVersions extends Script {
  override async execute(): Promise<void> {
    console.other('Loading all minecraft versions in to the database');
    const res = await this.scriptManager.Application.requestHandler.request(
      'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
    );
    const versions: Version[] = res.data.versions;
    for (const version of versions.reverse()) {
      const fetchedVersion = await this.scriptManager.Application.requestHandler.request(version.url);
      const fetchedVersionData: FetchedVersion = fetchedVersion.data;
      this.scriptManager.Application.mongo.version
        .saveItem({
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
        })
        .then(() => console.other(`Loaded ${version.id} into the database`));
    }
  }
}

export default LoadVersions;
