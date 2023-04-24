const path = require('path');
const AssetEntry = require('./AssetEntry');
const Options = require('./Options');
const Collection = require('./Collection');

class AssetScript {
  /**
   * Unique last index for each file with the same name.
   * @type {Object<file: string, index: number>}
   */
  static index = {};

  /**
   * The cache of dependencies.
   * The key is the resolved source file.
   * The value is the unique entry name.
   *
   * @type {Map<string, string>}
   */
  static files = new Map();

  /**
   * Add the script to cache.
   * After rebuild, the scripts loaded from node modules will be added to compilation from the cache.
   * Called after AssetScript.optimizeDependencies.
   *
   * @param {string} resource The resource file, including a query.
   * @param {string} issuer
   * @param {string} context
   * @return {boolean|undefined}
   */
  static add({ resource, issuer, context }) {
    if (this.files.has(resource)) {
      // skip already added dependencies by optimizeDependencies
      return;
    }

    const name = this.getUniqueName(resource);
    const entry = {
      name,
      importFile: resource,
      filenameTemplate: Options.getJs().filename,
      context,
      issuer,
    };

    Collection.setName(resource, name);

    if (AssetEntry.addToCompilation(entry)) {
      this.files.set(resource, name);
      return;
    }

    return false;
  }

  /**
   * @param {string} file The source file of script.
   * @return {string } Return unique assetFile
   */
  static getUniqueName(file) {
    const { name } = path.parse(file);
    let uniqueName = name;

    // the entrypoint name must be unique, if already exists then add an index: `main` => `main.1`, etc.
    if (!AssetEntry.isUnique(name, file)) {
      if (!this.index[name]) {
        this.index[name] = 1;
      }
      uniqueName = name + '.' + this.index[name]++;
    }

    return uniqueName;
  }

  /**
   * Clear cache.
   * Called only once when the plugin is applied.
   */
  static clear() {
    this.index = {};
    this.files.clear();
    Collection.clear();
  }

  /**
   * Reset settings.
   * Called before each new compilation after changes, in the serv/watch mode.
   */
  static reset() {
    this.index = {};
    Collection.reset();
  }
}

module.exports = AssetScript;
