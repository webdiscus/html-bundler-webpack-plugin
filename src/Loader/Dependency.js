const path = require('path');
const PluginService = require('../Plugin/PluginService');
const Options = require('./Options');
const { isWin } = require('./Utils');
const { watchPathsException } = require('./Messages/Exeptions');

/**
 * Dependencies in code for watching a changes.
 */
class Dependency {
  /** The file system used by Webpack */
  static fileSystem = null;
  static files = new Set();
  static loaderContext = null;
  static watchFiles = {};

  static init(loaderContext) {
    const { rootContext } = loaderContext;

    this.watchFiles = Options.getWatchFiles();
    this.loaderContext = loaderContext;

    if (this.fileSystem == null) {
      this.fileSystem = loaderContext._compilation.fileSystemInfo.fs.fileSystem;
    }

    if (PluginService.isWatchMode()) {
      for (const watchDir of this.watchFiles.paths) {
        const dir = path.isAbsolute(watchDir) ? watchDir : path.join(rootContext, watchDir);
        const files = this.#readDirRecursiveSync(dir);

        for (const file of files) {
          this.#addFile(file);
        }
      }
    }
  }

  /**
   * Add file to watch list considering exclude and include filter.
   *
   * @param {string} file
   */
  static add(file) {
    if (!PluginService.isWatchMode()) return;

    const { files, ignore } = this.watchFiles;
    const noFiles = files.length < 1;

    if (!ignore.find((regex) => regex.test(file)) && (noFiles || files.find((regex) => regex.test(file)))) {
      this.#addFile(file);
    }
  }

  /**
   * Enable Webpack watching for dependencies.
   */
  static watch() {
    if (!PluginService.isWatchMode()) return;

    const { loaderContext } = this;
    const files = Array.from(this.files);

    files.forEach(loaderContext.addDependency);
  }

  /**
   * @param {string} file
   * @private
   */
  static #addFile(file) {
    file = isWin ? path.normalize(file) : file;
    this.files.add(file);
    // delete the file from require.cache to reload cached file after change
    if (require.cache[file]) delete require.cache[file];
  }

  /**
   * Returns a list of absolut files.
   *
   * @param {string} dir The starting directory.
   * @return {Array<string>}
   * @private
   */
  static #readDirRecursiveSync(dir) {
    const fs = this.fileSystem;
    const { files, ignore } = this.watchFiles;
    const noFiles = files.length < 1;

    if (!fs.existsSync(dir)) {
      watchPathsException(dir, this.watchFiles.paths);
    }

    /**
     * @param {string} dir
     * @return {Array<string>}
     */
    const readDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const result = [];

      for (const file of entries) {
        const fullPath = path.join(dir, file.name);

        if (!ignore.find((regex) => regex.test(fullPath))) {
          if (file.isDirectory()) result.push(...readDir(fullPath));
          else if (noFiles || files.find((regex) => regex.test(fullPath))) result.push(fullPath);
        }
      }

      return result;
    };

    return readDir(dir);
  }
}

module.exports = Dependency;
