import './src/Private/Logger.js';

import Application from './src/Application.js';

for (const key of ['DISCORD_TOKEN', 'DISCORD_LOGS_CHANNEL', 'MONGO_URL']) {
  if (!process.env[key]) throw new Error(`Missing env option - ${key}`);
}

const application = new Application();
application.connect();
