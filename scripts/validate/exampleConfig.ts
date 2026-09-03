import ConfigManager from '../../src/ConfigManager.js';
import '../../src/private/logger.js';

await ConfigManager.validateExampleConfig();
process.exit(0);
