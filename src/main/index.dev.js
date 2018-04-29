/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint import/no-extraneous-dependencies: 0 */

// Set environment for development
// process.env.NODE_ENV = 'development'; // add error

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true });

// Install `vue-devtools`
require('electron').app.on('ready', () => {
  const installExtension = require('electron-devtools-installer');
  installExtension.default(installExtension.VUEJS_DEVTOOLS)
    .then(() => {})
    .catch((err) => {
      /* eslint no-console: 0 */
      console.log('Unable to install `vue-devtools`: \n', err);
    });
});

// Require `main` process to boot app
require('./index');
