import CheckForNewVersions from './Scripts/CheckForNewVersions.js';
import LoadVersions from './Scripts/LoadVersion.js';
import type Application from '../Application.js';

class ScriptManager {
  readonly Application: Application;
  readonly checkForNewVersions: CheckForNewVersions;
  readonly loadVersions: LoadVersions;
  constructor(app: Application) {
    this.Application = app;
    this.checkForNewVersions = new CheckForNewVersions(this);
    this.loadVersions = new LoadVersions(this);

    setInterval(
      () => this.checkForNewVersions.execute(),
      Number(process.env.CHECK_FOR_NEW_VERSIONS_DELAY ?? '3') * 60 * 100
    );
  }
}

export default ScriptManager;
