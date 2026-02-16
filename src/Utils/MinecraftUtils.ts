import type Application from '../Application.js';
import type { Version } from '../Mongo/Version/Schema.js';
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
}

export default MinecraftUtils;
