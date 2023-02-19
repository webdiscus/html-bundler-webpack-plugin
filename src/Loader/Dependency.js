const path = require('path');
const { isWin } = require('./Utils');
const Options = require('./Options');

/**
 * Dependencies in code for watching a changes.
 */
class Dependency {
  static files = new Set();
  static loaderContext = null;
  static watchFiles = [];

  static init(loaderContext) {
    this.watchFiles = Options.getWatchFiles();
    this.loaderContext = loaderContext;
  }

  /**
   * Add file to watch list.
   *
   * @param {string} file
   */
  static add(file) {
    if (!this.watchFiles.find((regex) => regex.test(file))) {
      return;
    }

    file = isWin ? path.normalize(file) : file;
    this.files.add(file);

    // delete the file from require.cache to reload cached files after changes by watch
    delete require.cache[file];
  }

  /**
   * Enable Webpack watching for dependencies.
   */
  static watch() {
    const { loaderContext } = this;
    const files = Array.from(this.files);

    if (loaderContext != null) {
      files.forEach(loaderContext.addDependency);
    }
  }
}

module.exports = Dependency;
