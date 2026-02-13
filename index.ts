// Logger should always be imported first in your main file
// You want the logger to be loaded from the start because it changes how the built in console object works
// Not loading it first can cause issues where stuff that is expected to be defined via the logger may not exist because it not being loaded
import './src/Private/Logger.js';

import Application from './src/Application.js';

const application = new Application();
application.connect();
