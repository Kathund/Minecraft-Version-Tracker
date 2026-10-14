import BasicScript from '../BasicScript.ts';
import MinecraftVersionTrackerError from '../../private/error.ts';
import { MojangPistonVersionResponse } from '../../types/requests.ts';
import type CheckForNewVersions from './CheckForNewVersionsScript.ts';
import type ScriptManager from '../ScriptManager.ts';

class LoadAllVersions extends BasicScript {
  constructor(scripts: ScriptManager) {
    super(scripts, { id: 'loadAllVersions' });
  }

  override async execute() {
    const versions = await this.scripts.application.request<MojangPistonVersionResponse>(
      'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json',
      MojangPistonVersionResponse
    );
    if (!versions) throw new MinecraftVersionTrackerError('Could not fetch the full version list');

    const script = this.scripts.getScript<CheckForNewVersions>('checkForNewVersions');
    if (!script) throw new MinecraftVersionTrackerError('Could not find the `checkForNewVersions` script');

    for (const version of versions.versions) await script.loadNewVersion(version);
    console.scripts('Loaded all the versions into the database');
  }
}

export default LoadAllVersions;
