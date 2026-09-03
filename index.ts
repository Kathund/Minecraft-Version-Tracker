import ConfigManager from './src/ConfigManager.js';
import { mkdir } from 'node:fs/promises';
import './src/private/logger.js';

await mkdir('./data/', { recursive: true });

const configManager = new ConfigManager();
const config = await configManager.init();

const { default: Application } = await import('./src/Application.js');
const application = new Application(config);
await application.database.checkForDatabase();
await application.database.checkForMigrations();
await application.scripts.init();

const databaseVersions = application.database.getVersionIds();
if (databaseVersions.length === 0) {
  console.other('No versions inside of the database... Loading them all');
  const script = application.scripts.getScript('loadAllVersions');
  if (!script) {
    console.error('Could not find the `loadAllVersions` script');
    process.exit(1);
  }
  await script.execute();
}

await application.discord.connect();
