const path = require('path');
const { isWin, pathToPosix } = require('./Utils');

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
   *
   * @param {string} outputPath
   * @param {string | undefined} publicPath
   */
  static init({ outputPath, publicPath }) {
    if (typeof publicPath === 'function') {
      publicPath = publicPath.call(null, {});
    }

    this.outputPath = outputPath;
    this.publicPath = publicPath === undefined ? 'auto' : publicPath;

    // reset initial states
    this.isAutoPublicPath = false;
    this.isUrlPublicPath = false;
    this.isRelativePublicPath = false;

    if (this.publicPath === 'auto') {
      this.isAutoPublicPath = true;
    } else if (/^(\/\/|https?:\/\/)/i.test(this.publicPath)) {
      this.isUrlPublicPath = true;
    } else if (!this.publicPath.startsWith('/')) {
      this.isRelativePublicPath = true;
    }
  }

  /**
   * Reset settings.
   * This method is called before each compilation after changes by `webpack serv/watch`.
   */
  static reset() {
    this.fileIndex = {};
    this.files.clear();
  }

  /**
   * Get the publicPath.
   *
   * @param {string | null} assetFile The output asset filename relative by output path.
   * @return {string}
   */
  static getPublicPath(assetFile = null) {
    let isAutoRelative = assetFile && this.isRelativePublicPath && !assetFile.endsWith('.html');

    if (this.isAutoPublicPath || isAutoRelative) {
      if (!assetFile) return '';

      const fullFilename = path.resolve(this.outputPath, assetFile);
      const context = path.dirname(fullFilename);
      const publicPath = path.relative(context, this.outputPath) + '/';

      return isWin ? pathToPosix(publicPath) : publicPath;
    }

    return this.publicPath;
  }

  /**
   * Get the output asset file regards the publicPath.
   *
   * @param {string} assetFile The output asset filename relative by output path.
   * @param {string} issuer The output issuer filename relative by output path.
   * @return {string}
   */
  static getOutputFile(assetFile, issuer) {
    let isAutoRelative = issuer && this.isRelativePublicPath && !issuer.endsWith('.html');

    // if public path is relative, then a resource using not in the template file must be auto resolved
    if (this.isAutoPublicPath || isAutoRelative) {
      if (!issuer) return assetFile;

      const issuerFullFilename = path.resolve(this.outputPath, issuer);
      const context = path.dirname(issuerFullFilename);
      const file = path.posix.join(this.outputPath, assetFile);
      const outputFilename = path.relative(context, file);

      return isWin ? pathToPosix(outputFilename) : outputFilename;
    }

    return path.posix.join(this.publicPath, assetFile);
  }

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
   * Find asset file by its source file.
   *
   * @param {string} sourceFile The source file.
   * @return {string|null} The asset file.
   */
  static findAssetFile(sourceFile) {
    return this.files.get(sourceFile);
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
}

module.exports = Asset;
