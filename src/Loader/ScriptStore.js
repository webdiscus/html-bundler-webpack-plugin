const { isInline } = require('./Utils');

/**
 * Store of script files from `script` tag for sharing with the plugin.
 */

class ScriptStore {
  static files = [];

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
   * @param {string} issuer The source file of issuer of the required file.
   * @param {string} filename The output asset filename of issuer.
   */
  static setIssuerFilename(issuer, filename) {
    for (let item of this.files) {
      if (item.issuer.request === issuer) {
        item.issuer.filename = filename;
      }
    }
  }

  static getAll() {
    return this.files;
  }

  static clear() {
    this.files = [];
  }
}

module.exports = ScriptStore;
