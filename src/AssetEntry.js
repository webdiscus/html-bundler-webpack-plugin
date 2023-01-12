const path = require('path');
const { isFunction } = require('./Utils');

class AssetEntry {
  /** @type {Map<string, AssetEntryOptions>} */
  static entryMap = new Map();
  static compilationEntryNames = new Set();

  static compilation = null;
  static EntryPlugin = null;

  /**
   * @param {string} outputPath The Webpack output path.
   */
  static setWebpackOutputPath(outputPath) {
    this.webpackOutputPath = outputPath;
  }

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  static setCompilation(compilation) {
    this.compilation = compilation;
    this.EntryPlugin = compilation.compiler.webpack.EntryPlugin;
  }

  /**
   * @param {string} name The entry name.
   * @returns {AssetEntryOptions}
   */
  static get(name) {
    return this.entryMap.get(name);
  }

  /**
   * @param {{}} entry The webpack entry object.
   * @param {AssetEntryOptions} assetEntryOptions
   */
  static add(entry, assetEntryOptions) {
    const { name, outputPath, filenameTemplate } = assetEntryOptions;
    const relativeOutputPath = path.isAbsolute(outputPath)
      ? path.relative(this.webpackOutputPath, outputPath)
      : outputPath;

    entry.filename = (pathData, assetInfo) => {
      if (assetEntryOptions.filename != null) return assetEntryOptions.filename;

      // the `filename` property of the `PathData` type should be a source file, but in entry this property not exists
      if (pathData.filename == null) {
        pathData.filename = assetEntryOptions.importFile;
      }

      let filename = isFunction(filenameTemplate) ? filenameTemplate(pathData, assetInfo) : filenameTemplate;
      if (relativeOutputPath) {
        filename = path.posix.join(relativeOutputPath, filename);
      }
      assetEntryOptions.filename = filename;

      return filename;
    };

    this.entryMap.set(name, assetEntryOptions);
  }

  /**
   * Add a script to webpack compilation.
   *
   * @param {string} name
   * @param {string} importFile
   * @param {string} filenameTemplate
   * @param {string} context
   * @param {string} issuer
   * @return {boolean} Return true if new file was added, if a file exists then return false.
   */
  static addToCompilation({ name, importFile, filenameTemplate, context, issuer }) {
    // skip duplicate entries
    if (this.inEntry(name, importFile)) return false;

    const entry = {
      name,
      runtime: undefined,
      layer: undefined,
      dependOn: undefined,
      baseUri: undefined,
      publicPath: undefined,
      chunkLoading: undefined,
      asyncChunks: undefined,
      wasmLoading: undefined,
      library: undefined,
    };

    /** @type {AssetEntryOptions} */
    const assetEntryOptions = {
      name,
      filenameTemplate,
      filename: undefined,
      file: undefined,
      importFile,
      sourcePath: context,
      outputPath: this.webpackOutputPath,
      postprocess: undefined,
      extract: undefined,
      verbose: false,
    };

    this.add(entry, assetEntryOptions);
    this.compilationEntryNames.add(name);

    // adds the entry of the script from the template to the compilation
    // see reference: node_modules/webpack/lib/EntryPlugin.js
    const entryDependency = this.EntryPlugin.createDependency(importFile, { name });
    this.compilation.addEntry(context, entryDependency, entry, (err) => {
      if (err) throw new Error(err);
    });

    return true;
  }

  /**
   * Whether the entry is unique.
   *
   * @param {string} name The name of the entry.
   * @param {string} file The source file.
   * @return {boolean}
   */
  static isUnique(name, file) {
    const entry = this.entryMap.get(name);
    return !entry || entry.importFile === file;
  }

  /**
   * Whether the file in the entry already exists.
   *
   * @param {string} name The name of the entry.
   * @param {string} file The source file.
   * @return {boolean}
   */
  static inEntry(name, file) {
    const entry = this.entryMap.get(name);
    return entry && entry.importFile === file;
  }

  /**
   * Clear caches.
   * This method is called only once, when the plugin is applied.
   */
  static clear() {
    this.entryMap.clear();
  }

  /**
   * Remove entries added not via webpack entry.
   * This method is called before each compilation after changes by `webpack serv/watch`.
   */
  static reset() {
    for (const entryName of this.compilationEntryNames) {
      this.entryMap.delete(entryName);
    }
    this.compilationEntryNames.clear();
  }
}

module.exports = AssetEntry;
