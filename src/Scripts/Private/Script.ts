import type ScriptManager from '../ScriptManager.js';

class Script {
  protected readonly scriptManager: ScriptManager;
  constructor(scriptManager: ScriptManager) {
    this.scriptManager = scriptManager;
  }

  execute(): Promise<void> | void {
    throw new Error('Execute Method not implemented!');
  }
}

export default Script;
