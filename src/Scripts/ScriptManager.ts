import LoadVersions from './Scripts/LoadVersion.js';
import type Application from '../Application.js';

class ScriptManager {
  readonly Application: Application;
  readonly loadVersions: LoadVersions;
  constructor(app: Application) {
    this.Application = app;
    this.loadVersions = new LoadVersions(this);
  }
}

export default ScriptManager;
