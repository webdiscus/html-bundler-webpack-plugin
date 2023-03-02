const path = require('path');
const PluginService = require('../Plugin/PluginService');
const AssetEntry = require('../Plugin/AssetEntry');
const Options = require('./Options');
const { isWin } = require('./Utils');
const { verboseWatchFiles } = require('./Messages/Info');

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

    const { rootContext } = loaderContext;

    this.loaderContext = loaderContext;
    this.fileSystem = loaderContext.fs.fileSystem;
    this.watchFiles = Options.getWatchFiles();
    this.#entryFiles = AssetEntry.getEntryFiles();
    this.addFile = this.addFile.bind(this);
    this.files = new Set();

    for (const watchDir of this.watchFiles.paths) {
      const dir = path.isAbsolute(watchDir) ? watchDir : path.join(rootContext, watchDir);
      const files = this.#readDirRecursiveSync(dir);
      files.forEach(this.addFile);
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
      this.addFile(file);
    }
  }

  /**
   * @param {string} file
   * @private
   */
  static addFile(file) {
    file = isWin ? path.normalize(file) : file;
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
    const files = Array.from(this.files);

    for (let file of files) {
      if (entryFiles.indexOf(file) < 0) {
        // the dependency already contains the current resource file,
        // add for watching only files not defined in the entry to avoid unnecessary rebuilding of all templates
        loaderContext.addDependency(file);
      }
    }

    if (PluginService.getOptions().isVerbose()) {
      verboseWatchFiles([...this.files]);
    }
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
