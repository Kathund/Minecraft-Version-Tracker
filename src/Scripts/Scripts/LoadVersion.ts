import Script from '../Private/Script.js';
import type { Version } from '../../Mongo/Version/Schema.js';

class LoadVersions extends Script {
  override async execute(): Promise<void> {
    console.other('Loading all minecraft versions in to the database');
    const res = await this.scriptManager.Application.requestHandler.request(
      'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json'
    );
    const versions: Version[] = res.data.versions;
    for (const version of versions.reverse()) {
      this.scriptManager.Application.mongo.version
        .saveItem(await this.scriptManager.Application.minecraftUtils.convertVersion(version))
        .then(() => console.other(`Loaded ${version.id} into the database`));
    }
  }
}

export default LoadVersions;
