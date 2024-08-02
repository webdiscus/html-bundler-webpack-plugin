class Asset {
  /**
   * Unique last index for each file with the same name.
   * @type {Object<file: string, index: number>}
   */
  index = {};

  /**
   * The cache of resolved output asset filenames.
   * The key is the resolved source file.
   * The value is the output asset filename.
   *
   * @type {Map<string, string>}
   */
  files = new Map();

  constructor() {}

  /**
   * Add resolved module asset.
   * This asset can be as issuer for other resource assets.
   *
   * @param {string} resource The resource file, including a query.
   * @param {string} filename The output filename.
   */
  add(resource, filename) {
    this.files.set(resource, filename);
  }

  /**
   * @param {string} sourceFile The source file, without a query.
   * @param {string} assetFile The output filename.
   * @return {{isCached: boolean, filename: string}}
   */
  getUniqueFilename(sourceFile, assetFile) {
    if (this.files.has(sourceFile)) {
      return {
        isCached: true,
        filename: this.files.get(sourceFile),
      };
    }

    let uniqueFilename = assetFile;

    if (!this.index[assetFile]) {
      this.index[assetFile] = 1;
    } else {
      const uniqId = this.index[assetFile]++;
      let pos = assetFile.lastIndexOf('.');

      // paranoid check of the filename extension, because it is very sensible, should normally never occur
      if (pos < 0) pos = assetFile.length;
      uniqueFilename = assetFile.slice(0, pos) + '.' + uniqId + assetFile.slice(pos);
    }

    this.files.set(sourceFile, uniqueFilename);

    return {
      isCached: false,
      filename: uniqueFilename,
    };
  }

  /**
   * Reset settings.
   * Called before each new compilation after changes, in the serve/watch mode.
   */
  reset() {
    this.index = {};
    this.files.clear();
  }
}

module.exports = Asset;
