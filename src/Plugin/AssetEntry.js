const path = require('path');
const Options = require('./Options');
const PluginService = require('./PluginService');
const { isFunction } = require('../Common/Helpers');

/**
 * @typedef {Object} AssetEntryOptions
 * @property {string} name The key of webpack entry.
 * @property {string} file The output asset file with absolute path.
 * @property {string} assetFile The output asset file with relative path by webpack output path.
 *   Note: the method compilation.emitAsset() use this file as key of assets object
 *   and save the file relative by output path, defined in webpack.options.output.path.
 * @property {string|function(PathData, AssetInfo): string} filenameTemplate The filename template or function.
 * @property {string} filename The asset filename.
 *  The template strings support only these substitutions: [name], [base], [path], [ext], [id], [contenthash], [contenthash:nn]
 *  See https://webpack.js.org/configuration/output/#outputfilename
 * @property {string} request The full path of import file with query.
 * @property {string} importFile The import file only w/o query.
 * @property {string} outputPath
 * @property {string} sourcePath
 * @property {{name: string, type: string}} library Define the output a js file.
 *  See https://webpack.js.org/configuration/output/#outputlibrary
 * @property {function(string, AssetInfo, Compilation): string} [postprocess = null] The post process for extracted content from entry.
 * @property {function(): string|null =} extract
 * @property {Array} resources
 * @property {boolean|string} [verbose = false] Show an information by handles of the entry in a postprocess.
 * @property {boolean} isTemplate Whether the entry is a template entrypoint.
 */

class AssetEntry {
  /** @type {Map<string, AssetEntryOptions>} */
  static entryMap = new Map();
  static compilationEntryNames = new Set();
  static entryFiles = [];
  static entryPointExtensions = new Set();

  static compilation = null;
  static EntryPlugin = null;

  // the id to bind loader with data passed into template via entry.data
  static dataIndex = 1;
  static data = new Map();

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

  static getData(id) {
    return this.data.get(id);
  }

  /**
   * @return {Array<string>}
   */
  static getEntryFiles() {
    return this.entryFiles;
  }

  /**
   * @param {Array<Object>} entries
   * @param {Object} entryLibrary
   */
  static addEntries(entries, { entryLibrary }) {
    for (let name in entries) {
      const entry = entries[name];
      const importFile = entry.import[0];
      let request = importFile;
      let [sourceFile] = importFile.split('?', 1);
      const module = Options.getModule(sourceFile);
      let { filename: filenameTemplate, sourcePath, outputPath, postprocess, extract } = Options.get();
      let verbose = Options.isVerbose();

      if (!Options.isEntry(sourceFile) && !module) continue;

      if (!entry.library) entry.library = entryLibrary;

      if (module) {
        if (module.hasOwnProperty('verbose')) verbose = Options.toBool(module.verbose, false, false);
        if (module.filename) filenameTemplate = module.filename;
        if (module.sourcePath) sourcePath = module.sourcePath;
        if (module.outputPath) outputPath = module.outputPath;
        if (module.postprocess) postprocess = module.postprocess;
        if (module.extract) extract = module.extract;
      }
      if (entry.filename) filenameTemplate = entry.filename;

      if (!path.isAbsolute(sourceFile)) {
        request = path.join(sourcePath, request);
        sourceFile = path.join(sourcePath, sourceFile);
        entry.import[0] = path.join(sourcePath, importFile);
      }

      /** @type {AssetEntryOptions} */
      const assetEntryOptions = {
        name,
        filenameTemplate,
        filename: undefined,
        file: undefined,
        request,
        importFile: sourceFile,
        sourcePath,
        outputPath,
        library: entry.library,
        postprocess: isFunction(postprocess) ? postprocess : null,
        extract: isFunction(extract) ? extract : null,
        verbose,
        isTemplate: undefined,
      };

      if (entry.data) {
        // IMPORTANT: when the entry contains same source file for many chunks, for example:
        // {
        //   page1: { import: 'src/template.html', data: { title: 'A'} },
        //   page2: { import: 'src/template.html', data: { title: 'B'} },
        // }
        // add an unique identifier of the entry to execute a loader for all templates,
        // otherwise Webpack call a loader only for the first template.
        // See 'webpack/lib/NormalModule.js:identifier()'.

        entry.layer = `__entryDataId=${this.dataIndex}`;
        this.data.set(`${this.dataIndex}`, entry.data);
        this.dataIndex++;
      }

      this.entryFiles.push(sourceFile);
      this.#add(entry, assetEntryOptions);
    }
  }

  /**
   * @param {{}} entry The webpack entry object.
   * @param {AssetEntryOptions} assetEntryOptions
   * @private
   */
  static #add(entry, assetEntryOptions) {
    const { name, outputPath, filenameTemplate } = assetEntryOptions;
    const relativeOutputPath = path.isAbsolute(outputPath)
      ? path.relative(Options.getWebpackOutputPath(), outputPath)
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
      assetEntryOptions.isTemplate = Options.isEntry(assetEntryOptions.importFile);

      if (assetEntryOptions.isTemplate) {
        const ext = this.#getFileExtension(filename);
        this.entryPointExtensions.add(ext);
      }

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
    if (this.#exists(name, importFile)) return false;

    const compilation = this.compilation;
    const EntryPlugin = compilation.compiler.webpack.EntryPlugin;
    const entryDependency = EntryPlugin.createDependency(importFile, { name });

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
      outputPath: Options.getWebpackOutputPath(),
      postprocess: undefined,
      extract: undefined,
      verbose: false,
    };

    this.#add(entry, assetEntryOptions);
    this.compilationEntryNames.add(name);

    // add the script resolved in the template to the compilation
    compilation.addEntry(context, entryDependency, entry, (err) => {
      if (err) throw new Error(err);
    });

    // add missing dependencies after rebuild
    if (PluginService.isWatchMode()) {
      new EntryPlugin(context, importFile, { name }).apply(compilation.compiler);
    }

    return true;
  }

  /**
   * Set generated output filename.
   *
   * Called by renderManifest() stage.
   *
   * @param {AssetEntryOptions} entry
   * @param {Chunk} chunk The Webpack Chunk object.
   */
  static setFilename(entry, chunk) {
    entry.filename = this.compilation.getPath(chunk.filenameTemplate, { contentHashType: 'javascript', chunk });
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
   * Whether the output filename is a template entrypoint.
   *
   * @param {string} filename The output filename.
   * @return {boolean}
   */
  static isEntrypoint(filename) {
    const ext = this.#getFileExtension(filename);
    return this.entryPointExtensions.has(ext);
  }

  static #getFileExtension(file) {
    return file.slice(file.lastIndexOf('.'));
  }

  /**
   * Whether the file in the entry already exists.
   *
   * @param {string} name The name of the entry.
   * @param {string} file The source file.
   * @return {boolean}
   * @private
   */
  static #exists(name, file) {
    const entry = this.entryMap.get(name);
    return entry && entry.importFile === file;
  }

  /**
   * Clear caches.
   * Called only once, when the plugin is applied.
   */
  static clear() {
    this.entryMap.clear();
    this.entryPointExtensions.clear();
    this.entryFiles.length = 0;
  }

  /**
   * Remove entries added not via webpack entry.
   * Called before each compilation after changes by `webpack serv/watch`.
   */
  static reset() {
    for (const entryName of this.compilationEntryNames) {
      this.entryMap.delete(entryName);
    }
    this.compilationEntryNames.clear();
  }
}

module.exports = AssetEntry;
