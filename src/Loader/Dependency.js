const { isWin } = require('./Utils');
const path = require('path');

/**
 * Dependencies in code for watching a changes.
 */
class Dependency {
  static files = new Set();
  static watchFiles = [/\.(html|js.{0,2}|.?js|ts.?|md|txt)$/i];
  static loaderContext = null;
  static isInit = false;

  static init({ loaderContext, watchFiles }) {
    // avoid double push in array by watching
    if (!this.isInit && watchFiles != null) {
      this.isInit = true;

      if (!Array.isArray(watchFiles)) watchFiles = [watchFiles];

      for (let i = 0; i < watchFiles.length; i++) {
        let re = watchFiles[i];
        if (re.constructor.name !== 'RegExp') {
          re = new RegExp(re);
        }
        this.watchFiles.push(re);
      }
    }

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
