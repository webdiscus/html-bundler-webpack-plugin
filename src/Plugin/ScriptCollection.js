const { isInline } = require('../Loader/Utils');

/**
 * Store of script files from `script` tag for sharing with the plugin.
 */

class ScriptCollection {
  static files = new Map();

  static init({ issuer }) {
    this.issuer = issuer;
  }

  /**
   * @param {string} file The source file.
   * @return {boolean}
   */
  static has(file) {
    return this.files.has(file);
  }

  /**
   * Add a unique script file by current issuer.
   *
   * @param {string} resource The source file, including query.
   */
  static add(resource) {
    const [file, query] = resource.split('?', 1);

    let item = this.files.get(file);
    if (!item) {
      item = {
        name: undefined,
        file,
        query,
        inline: isInline(resource),
        issuers: [],
        chunkFiles: new Set(),
      };
      this.files.set(file, item);
    }

    // add only unique issuer
    if (!item.issuers.find(({ request }) => request === this.issuer)) {
      item.issuers.push({
        request: this.issuer,
        assets: new Map(),
      });
    }
  }

  /**
   * Set asset name, the filename part w/o path, hash, extension.
   * One script can be used in many templates.
   *
   * @param {string} file The source file of script.
   * @param {string} name The unique name of entry point.
   */
  static setName(file, name) {
    let item = this.files.get(file);
    if (item) {
      item.name = name;
    }
  }

  /**
   * @param {string} entryPoint The source file of an entry point.
   * @param {string} filename The output asset filename of issuer.
   */
  static setIssuerFilename(entryPoint, filename) {
    for (let { issuers } of this.files.values()) {
      const item = issuers.find(({ request }) => request === entryPoint);
      if (item) {
        // the key is an issuer output filename
        // the value is an array of script output filenames, will be defined later, in 'afterProcessAssets'
        item.assets.set(filename, []);
      }
    }
  }

  static getEntity(sourceFile) {
    return this.files.get(sourceFile);
  }

  static getAll() {
    return this.files;
  }

  /**
   * Clear cache.
   * Called only once, when the plugin is applied.
   */
  static clear() {
    this.files.clear();
  }

  /**
   * Reset settings.
   * Called before each compilation after changes by `webpack serv/watch`.
   */
  static reset() {
    // reserved
  }
}

module.exports = ScriptCollection;
