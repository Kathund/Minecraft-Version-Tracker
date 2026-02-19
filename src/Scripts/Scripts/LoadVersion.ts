import Script from '../Private/Script.js';

class LoadVersions extends Script {
  override async execute(): Promise<void> {
    console.other('Loading all minecraft versions in to the database');
    const versions = await this.scriptManager.Application.minecraftUtils.getVersions();
    for (const version of versions.reverse()) {
      this.scriptManager.Application.mongo.version
        .saveItem(await this.scriptManager.Application.minecraftUtils.convertVersion(version))
        .then(() => console.other(`Loaded ${version.id} into the database`));
    }
  }
}

export default LoadVersions;
