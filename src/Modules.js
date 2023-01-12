// Modules available in both plugin and loader.
// These modules store data for exchange between the plugin and the loader.

module.exports = require('./Loader/Modules.js');
module.exports.loader = require.resolve('./Loader');
