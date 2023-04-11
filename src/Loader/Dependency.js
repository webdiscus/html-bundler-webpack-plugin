const { readDirRecursiveSync } = require('../Common/FileUtils');
const PluginService = require('../Plugin/PluginService');
const AssetEntry = require('../Plugin/AssetEntry');
const Options = require('./Options');

/**
 * Dependencies in code for watching a changes.
 */
class Dependency {
  /** The file system used by Webpack */
  static fileSystem = null;
  static files = null;
  static loaderContext = null;
  static watchFiles = {};
  static #entryFiles = [];

  static init(loaderContext) {
    if (!PluginService.isWatchMode()) return;

    this.loaderContext = loaderContext;
    this.fileSystem = loaderContext.fs.fileSystem;
    this.watchFiles = Options.getWatchFiles();
    this.#entryFiles = AssetEntry.getEntryFiles();
    this.addFile = this.addFile.bind(this);
    this.files = new Set();

    const fs = this.fileSystem;
    const { files: includes, ignore: excludes } = this.watchFiles;

    for (const watchDir of this.watchFiles.paths) {
      const files = readDirRecursiveSync(watchDir, { fs, includes, excludes });
      files.forEach(this.addFile);
    }
  }

  /**
   * @param {string} file
   * @private
   */
  static addFile(file) {
    this.files.add(file);

    // delete the file from require.cache to reload cached file after change
    if (file in require.cache) {
      delete require.cache[file];
    }
  }

  /**
   * Enable Webpack watching for dependencies.
   */
  static watch() {
    if (!PluginService.isWatchMode()) return;

    const { loaderContext } = this;
    const entryFiles = this.#entryFiles;

    for (let file of this.files) {
      if (entryFiles.indexOf(file) < 0) {
        // the dependency already contains the current resource file,
        // add for watching only files not defined in the entry to avoid unnecessary rebuilding of all templates
        loaderContext.addDependency(file);
      }
    }
  }
}

module.exports = Dependency;
