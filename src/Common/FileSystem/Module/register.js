const path = require('path');
const { pathToFileURL } = require('url');
const { register } = require('module');

/**
 * Registers the module loader.
 *
 * @param {string} loader
 */
function registerLoader(loader = 'nocacheLoader.js') {
  const loaderPath = path.resolve(__dirname, loader);

  register(pathToFileURL(loaderPath));
}

module.exports = registerLoader;
