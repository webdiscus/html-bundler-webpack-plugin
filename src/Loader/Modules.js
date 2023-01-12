// Modules available in both plugin and loader.
// These modules store data for exchange between the plugin and the loader.

module.exports = {
  plugin: require('./Plugin.js'),
  scriptStore: require('./ScriptStore.js'),
};
