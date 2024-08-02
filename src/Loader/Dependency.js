const path = require('path');
const { readDirRecursiveSync } = require('../Common/FileUtils');
const PluginService = require('../Plugin/PluginService');

/**
 * Dependencies in code for watching a changes.
 */
class Dependency {
  /** The file system used by Webpack */
  fileSystem = null;
  files = new Set();
  directories = new Set();
  watchFiles = {};
  entryFiles = new Set();
  excludeDirs = [];
  loaderContext = null;
  pluginCompiler = null;

  constructor(compiler) {
    // create instance only to avoid cycle dependencies by initialisation
    this.pluginCompiler = compiler;
  }

  init({ loaderContext, loaderOption }) {
    this.loaderContext = loaderContext;
    this.loaderOption = loaderOption;

    if (!PluginService.isWatchMode(this.pluginCompiler)) return;

    let watchFile = this.loaderContext.resourcePath;

    PluginService.setDependencyInstance(this.pluginCompiler, this);

    this.fileSystem = this.loaderContext.fs.fileSystem;
    this.watchFiles = this.loaderOption.getWatchFiles();
    this.entryFiles = PluginService.getPluginContext(this.pluginCompiler).assetEntry.getEntryFiles();

    this.excludeDirs = [];
    this.entryFiles.forEach((entryFile) => {
      let entryDir = path.dirname(entryFile) + path.sep;
      if (!watchFile.startsWith(entryDir)) this.excludeDirs.push(entryDir);
    });

    this.addFileToWatch = this.addFileToWatch.bind(this);

    const fs = this.fileSystem;
    const { includes, excludes, paths = [] } = this.watchFiles;

    for (const watchDir of paths) {
      const files = readDirRecursiveSync(watchDir, { fs, includes, excludes });

      files.forEach(this.addFileToWatch);
    }

    const customWatchFiles = this.loaderOption.getCustomWatchFiles();
    if (customWatchFiles.length > 0) customWatchFiles.forEach(this.addFileToWatch);
  }

  /**
   * Check whether the adding file is watchable.
   *
   * @param {string} watchFile
   * @return boolean
   */
  isFileWatchable(watchFile) {
    if (!PluginService.isWatchMode(this.pluginCompiler)) return false;

    let { includes, excludes } = this.watchFiles;
    let isIncluded = includes ? includes.some((item) => item.test(watchFile)) : true;
    let isExcluded = excludes ? excludes.some((item) => item.test(watchFile)) : false;

    return isIncluded && !isExcluded;
  }

  /**
   * @param {string} dir
   */
  addDir(dir) {
    this.directories.add(dir);
  }

  /**
   * @return {Set<any>}
   */
  getFiles() {
    return this.files;
  }

  /**
   * Add file using include & exculude filter.
   *
   * @param {string} file
   */
  addFile(file) {
    if (this.isFileWatchable(file)) {
      this.addFileToWatch(file);
    }
  }

  /**
   * @param {string} file
   */
  addFileToWatch(file) {
    this.files.add(file);

    // delete the file from require.cache to reload cached file after change
    if (file in require.cache) {
      delete require.cache[file];
    }
  }

  /**
   * @param {string} file
   */
  removeFile(file) {
    this.files.delete(file);
  }

  /**
   * Enable Webpack watching for dependencies.
   */
  watch() {
    if (!PluginService.isWatchMode(this.pluginCompiler)) return;

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
  shutdown() {
    this.files.clear();
    this.directories.clear();
  }
}

module.exports = Dependency;
