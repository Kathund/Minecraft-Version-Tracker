import type { MinecraftVersionLinks } from '../Types/Minecraft.js';
import type { Version } from '../Mongo/Version/Schema.js';

// eslint-disable-next-line import/prefer-default-export
export async function getMinecraftArticleData(version: Version): Promise<MinecraftVersionLinks | null> {
  const response = await fetch(
    'https://gist.githubusercontent.com/Kathund/61625ab094cba15d0519f2ac83b4ca86/raw/MinecraftVersionMap.json'
  );
  if (response.status !== 200) return null;
  const json: Record<string, MinecraftVersionLinks> = await response.json();
  return json[version.id] ?? null;
}
