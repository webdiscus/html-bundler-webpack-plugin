const path = require('path');
const { readDirRecursiveSync } = require('../Common/FileUtils');
const PluginService = require('../Plugin/PluginService');
const AssetEntry = require('../Plugin/AssetEntry');
const Option = require('./Option');

/**
 * Dependencies in code for watching a changes.
 */
class Dependency {
  /** The file system used by Webpack */
  static fileSystem = null;
  static files = new Set();
  static directories = new Set();
  static watchFiles = {};
  static entryFiles = new Set();
  static excludeDirs = [];
  static loaderContext = null;

  static init(loaderContext) {
    if (!PluginService.isWatchMode()) return;

    let watchFile = loaderContext.resourcePath;

    PluginService.setDependencyInstance(this);
    this.loaderContext = loaderContext;
    this.fileSystem = loaderContext.fs.fileSystem;
    this.watchFiles = Option.getWatchFiles();
    this.entryFiles = AssetEntry.getEntryFiles();

    this.excludeDirs = [];
    this.entryFiles.forEach((entryFile) => {
      let entryDir = path.dirname(entryFile) + path.sep;
      if (!watchFile.startsWith(entryDir)) this.excludeDirs.push(entryDir);
    });

    this.addFile = this.addFile.bind(this);

    const fs = this.fileSystem;
    const { files: includes, ignore: excludes, paths = [] } = this.watchFiles;

    for (const watchDir of paths) {
      const files = readDirRecursiveSync(watchDir, { fs, includes, excludes });
      files.forEach(this.addFile);
    }

    const customWatchFiles = Option.getCustomWatchFiles();
    if (customWatchFiles.length > 0) customWatchFiles.forEach(this.addFile);
  }

  /**
   * @param {string} dir
   */
  static addDir(dir) {
    this.directories.add(dir);
  }

  /**
   * @param {string} file
   */
  static addFile(file) {
    this.files.add(file);

    // delete the file from require.cache to reload cached file after change
    if (file in require.cache) {
      delete require.cache[file];
    }
  }

  /**
   * @param {string} file
   */
  static removeFile(file) {
    this.files.delete(file);
  }

  /**
   * Enable Webpack watching for dependencies.
   */
  static watch() {
    if (!PluginService.isWatchMode()) return;

    const { loaderContext, excludeDirs } = this;

    this.directories.forEach(loaderContext.addContextDependency);

    for (let file of this.files) {
      let isExcluded = excludeDirs.findIndex((dirname) => file.startsWith(dirname)) > -1;

      if (isExcluded || this.entryFiles.has(file)) {
        // ignore all files from other entry directory or the current entry file, because it is already in the list
        continue;
      }
      loaderContext.addDependency(file);
    }
  }

  /**
   * Called when the compiler is closing or a watching compilation has stopped.
   */
  static shutdown() {
    this.files.clear();
    this.directories.clear();
  }
}

module.exports = Dependency;
