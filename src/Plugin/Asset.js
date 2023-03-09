const Options = require('./Options');

class Asset {
  /**
   * The cache of resolved output asset filenames.
   * The key is the resolved source file.
   * The value is the output asset filename.
   *
   * @type {Map<string, string>}
   */
  static files = new Map();

  /**
   * Unique last index for each file with same name.
   * @type {Object<file: string, index: number>}
   */
  static fileIndex = {};

  /**
   * Add resolved module asset.
   * This asset can be as issuer for other resource assets.
   *
   * @param {string} sourceFile
   * @param {string} assetFile
   */
  static add(sourceFile, assetFile) {
    this.files.set(sourceFile, assetFile);
  }

  /**
   * Find output asset file by its source request.
   *
   * @param {string} request The source file including a query.
   * @return {string|null} The asset file.
   */
  static findAssetFile(request) {
    // Note: regard the request with a query only for entry.
    // E.g., 'index.html?lang=en' and 'index.html?lang=de' may have different output filenames
    // while 'style.css' and 'style.css?inline' have the same output filename

    if (!Options.isEntry(request)) {
      const [file] = request.split('?', 1);
      request = file;
    }
    return this.files.get(request);
  }

  /**
   * Find source file by its asset file.
   *
   * @param {string} assetFile The asset file.
   * @return {string|null} The source file.
   */
  static findSourceFile(assetFile) {
    const entries = this.files.entries();
    for (let [sourceFile, value] of entries) {
      if (value === assetFile) return sourceFile;
    }

    return null;
  }

  /**
   * @param {string} sourceFile
   * @param {string} assetFile
   * @return {{isCached: boolean, filename: string}}
   */
  static getUniqueFilename(sourceFile, assetFile) {
    if (this.files.has(sourceFile)) {
      return {
        isCached: true,
        filename: this.files.get(sourceFile),
      };
    }

    let uniqueFilename = assetFile;

    if (!this.fileIndex[assetFile]) {
      this.fileIndex[assetFile] = 1;
    } else {
      const uniqId = this.fileIndex[assetFile]++;
      let pos = assetFile.lastIndexOf('.');

      // paranoid check of the filename extension, because it is very sensible, should normally never occur
      if (pos < 0) pos = assetFile.length;
      uniqueFilename = assetFile.slice(0, pos) + '.' + uniqId + assetFile.slice(pos);
    }

    this.add(sourceFile, uniqueFilename);

    return {
      isCached: false,
      filename: uniqueFilename,
    };
  }

  /**
   * @param {{__isStyle?:boolean|undefined, __isDependencyTypeUrl?:boolean|undefined, resource:string, loaders:Array<{loader:string}>}} module The Webpack chunk module.
   *    Properties:<br>
   *      __isStyle {boolean} The cached state whether the Webpack module was resolved as style.<br>
   *      resource {string} The source file of Webpack module.<br>
   *      loaders {Array<string>} The loaders for this module.
   *
   * @return {boolean}
   */
  static isStyle(module) {
    if (module.__isStyle == null) {
      module.__isStyle = module.loaders.find((item) => item.loader.indexOf('css-loader') > 0) != null;
    }

    return module.__isStyle;
  }

  /**
   * Reset settings.
   * Called before each compilation after changes by `webpack serv/watch`.
   */
  static reset() {
    this.fileIndex = {};
    this.files.clear();
  }
}

module.exports = Asset;
