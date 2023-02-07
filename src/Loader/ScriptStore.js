const { isInline } = require('./Utils');

/**
 * Store of script files from `script` tag for sharing with the plugin.
 */

class ScriptStore {
  static files = [];
  static scriptIssuers = new Map();

  static init({ issuer }) {
    this.issuer = issuer;
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  static has(file) {
    return this.files.find((item) => item.file === file) != null;
  }

  /**
   * Add a script unique by issuer to store.
   *
   * @param {string} request The required resource file.
   */
  static add(request) {
    const [file] = request.split('?', 1);
    const entry = this.files.find((item) => item.name && item.file === file && item.issuer.request === this.issuer);

    if (entry != null) {
      entry.name = undefined;
      entry.issuer.filename = undefined;
      return;
    }

    // one issuer can have many scripts, one script can be in many issuers
    this.files.push({
      name: undefined,
      file,
      inline: isInline(request),
      issuer: {
        filename: undefined,
        request: this.issuer,
      },
    });
  }

  /**
   * Set asset name, the filename part w/o path, hash, extension.
   *
   * @param {string} file The source file of script.
   * @param {Set} issuers The issuer source files of the required file. One script can be used in many templates.
   * @param {string} name The unique name of entry point.
   */
  static setName(file, issuers, name) {
    for (let item of this.files) {
      if (item.file === file && issuers.has(item.issuer.request)) {
        item.name = name;
      }
    }
  }

  /**
   * @param {string} entryPoint The source file of an entry point.
   * @param {string} filename The output asset filename of issuer.
   */
  static setIssuerFilename(entryPoint, filename) {
    for (let { file, issuer } of this.files) {
      // one script file can be loaded on many pages generated from same template file
      if (issuer.filename == null && issuer.request === entryPoint) {
        const scriptIssuers = this.scriptIssuers.get(file);

        if (scriptIssuers == null || !scriptIssuers.has(filename)) {
          issuer.filename = filename;
          scriptIssuers == null ? this.scriptIssuers.set(file, new Set([filename])) : scriptIssuers.add(filename);
        }
      }
    }
  }

  static getAll() {
    return this.files;
  }

  /**
   * Clear cache.
   * Called only once, when the plugin is applied.
   */
  static clear() {
    this.files = [];
  }

  /**
   * Reset settings.
   * Called before each compilation after changes by `webpack serv/watch`.
   */
  static reset() {
    this.scriptIssuers.clear();
  }
}

module.exports = ScriptStore;
