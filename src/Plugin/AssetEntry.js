const path = require('path');
const Options = require('./Options');
const PluginService = require('./PluginService');
const { isFunction } = require('../Common/Helpers');

/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").Module} Module */
/** @typedef {import("webpack").Chunk} Chunk */
/** @typedef {import("webpack").EntryPlugin} EntryPlugin */
/** @typedef {import("webpack/Entrypoint").EntryOptions} EntryOptions */

/**
 * @typedef {Object} AssetEntryOptions
 * @property {number=} id The unique Id of the entry template.
 *   The entries added to compilation have not Id.
 *   Note: the same source file of a template can be defined under many entry names.
 *   In this case the entry.resource is not unique und must be used entry.id, implemented via entry/module layer.
 * @property {string} name The key of webpack entry.
 * @property {string|(function(PathData, AssetInfo): string)} filenameTemplate The filename template or function.
 * @property {string} filename The asset filename.
 *  The template strings support only these substitutions:
 *  [name], [base], [path], [ext], [id], [contenthash], [contenthash:nn]
 *  See https://webpack.js.org/configuration/output/#outputfilename
 *
 * TODO: check the 'file' property where is used and remove
 * @property {string=} file The output asset file with absolute path.
 * @property {string=} assetFile The output asset file with relative path by webpack output path.
 *   Note: the method compilation.emitAsset() use this file as key of assets object
 *   and save the file relative by output path, defined in webpack.options.output.path.
 * @property {string} resource The full path of import file with query.
 * @property {string} importFile The original import entry file.
 * @property {string} sourceFile The import file only w/o query.
 * @property {string} sourcePath The path where are source files.
 * @property {string} outputPath The absolute output path.
 * @property {string} publicPath The public path relative to outputPath.
 * @property {{name: string, type: string}} library Define the output a js file.
 *  See https://webpack.js.org/configuration/output/#outputlibrary
 * @property {boolean|string} [verbose = false] Show an information by handles of the entry in a postprocess.
 * @property {boolean} isTemplate Whether the entry is a template entrypoint.
 * @property {boolean} isStyle Whether the entry is a style defined in Webpack entry.
 * @property {Object=} originalEntry The original Webpack entry object form entry option.
 */

class AssetEntry {
  static entryIdKey = '__entryId';

  /** @type {Map<string, AssetEntryOptions>} */
  static entries = new Map();
  static entriesByResource = new Map();
  static compilationEntryNames = new Set();
  static entrySourceFiles = [];
  static entryFilenames = new Set();

  /** @type {Compilation} */
  static compilation = null;

  // the id to bind loader with data passed into template via entry.data
  static idIndex = 1;
  static data = new Map();

  /**
   * Whether the entry is unique.
   *
   * @param {string} name The name of the entry.
   * @param {string} file The source file.
   * @return {boolean}
   */
  static isUnique(name, file) {
    const entry = this.entries.get(name);
    return !entry || entry.sourceFile === file;
  }

  /**
   * Whether the output filename is a template entrypoint.
   *
   * @param {string} filename The output filename.
   * @return {boolean}
   */
  static isEntrypoint(filename) {
    return this.entryFilenames.has(filename);
  }

  /**
   * Get an entry object by name.
   *
   * @param {string} name The entry name.
   * @returns {AssetEntryOptions}
   */
  static get(name) {
    return this.entries.get(name);
  }

  static getById(id) {
    return this.entriesByResource.get(Number(id));
  }

  /**
   * Returns the entry of a resource like style or script by its filename, regardless a query.
   * Note: To get the entry of a template use the get() by name.
   *
   * @param {string} resource
   * @return {AssetEntryOptions|null}
   */
  static getByResource(resource) {
    for (let entry of this.entries.values()) {
      const [fileEntry] = entry.resource.split('?', 1);
      const [fileResource] = resource.split('?', 1);
      if (fileEntry === fileResource) return entry;
    }

    return null;
  }

  static getData(id) {
    return this.data.get(Number(id));
  }

  /**
   * @return {Array<string>}
   */
  static getEntryFiles() {
    return this.entrySourceFiles;
  }

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  static setCompilation(compilation) {
    this.compilation = compilation;
  }

  /**
   * @param {Module} module The Webpack Module of the entry asset.
   * @return {number|boolean} If module is the entry then return an id, otherwise return false.
   */
  static getEntryId(module) {
    const { layer } = module;

    if (layer && typeof layer === 'string' && layer.startsWith(this.entryIdKey)) {
      const [, entryId] = layer.split('=', 2);

      return Number(entryId);
    }

    return false;
  }

  /**
   * Set generated output filename for the asset defined as entrypoint.
   *
   * Called by renderManifest() stage.
   *
   * @param {AssetEntryOptions} entry
   * @param {Chunk} chunk The Webpack Chunk object.
   */
  static setFilename(entry, chunk) {
    if (!entry.isTemplate) {
      entry.filename = this.compilation.getPath(chunk.filenameTemplate, { contentHashType: 'javascript', chunk });
    }
  }

  static applyTemplateFilename(entry) {
    if (entry.isTemplate) {
      entry.filename = this.compilation.getAssetPath(entry.filenameTemplate, {
        // define the structure of the pathData argument with useful data for the filenameTemplate as a function
        chunk: {
          name: entry.name,
          runtime: entry.name,
        },
        runtime: entry.name,
        filename: entry.sourceFile,
        filenameTemplate: entry.filenameTemplate,
      });

      if (entry.publicPath) {
        entry.filename = path.posix.join(entry.publicPath, entry.filename);
      }

      this.entryFilenames.add(entry.filename);
    }
  }

  /**
   * @param {Array<Object>} entries
   * @param {Object} entryLibrary
   */
  static addEntries(entries, { entryLibrary }) {
    for (let name in entries) {
      const entry = entries[name];
      const importFile = entry.import[0];
      let resource = importFile;
      let [sourceFile] = importFile.split('?', 1);
      let options = Options.getEntryOptions(sourceFile);

      if (options == null) continue;

      // Note: the layer id for all entry dependencies must be the same,
      // so the index is incremented before the first usage in the new entry.
      const id = this.idIndex++;
      let { verbose, filename: filenameTemplate, sourcePath, outputPath } = options;

      if (!entry.library) entry.library = entryLibrary;
      if (entry.filename) filenameTemplate = entry.filename;
      if (entry.data) this.data.set(id, entry.data);

      if (!path.isAbsolute(sourceFile)) {
        resource = path.join(sourcePath, resource);
        sourceFile = path.join(sourcePath, sourceFile);
        entry.import[0] = path.join(sourcePath, importFile);
      }

      /** @type {AssetEntryOptions} */
      const assetEntryOptions = {
        id,
        name,
        filenameTemplate,
        filename: undefined,
        file: undefined,
        assetFile: undefined,
        resource,
        importFile,
        sourceFile,
        sourcePath,
        outputPath,
        publicPath: '',
        library: entry.library,
        verbose,
        isTemplate: Options.isEntry(sourceFile),
        isStyle: Options.isStyle(sourceFile),
        originalEntry: undefined,
      };

      // IMPORTANT: when the entry contains the same source file for many chunks, for example:
      // {
      //   page1: { import: 'src/template.html', data: { title: 'A'} },
      //   page2: { import: 'src/template.html', data: { title: 'B'} },
      // }
      // add an unique identifier of the entry to execute a loader for all templates,
      // otherwise Webpack call a loader only for the first template.
      // See 'webpack/lib/NormalModule.js:identifier()'.
      entry.layer = `${this.entryIdKey}=${id}`;

      this.#add(entry, assetEntryOptions);
      this.entrySourceFiles.push(sourceFile);
    }
  }

  /**
   * @param {EntryOptions} entry The Webpack entry option object.
   * @param {AssetEntryOptions} assetEntryOptions
   * @private
   */
  static #add(entry, assetEntryOptions) {
    const { name, filenameTemplate, outputPath } = assetEntryOptions;

    if (path.isAbsolute(assetEntryOptions.outputPath)) {
      assetEntryOptions.publicPath = path.relative(Options.getWebpackOutputPath(), assetEntryOptions.outputPath);
    }

    entry.filename = (pathData, assetInfo) => {
      if (assetEntryOptions.filename != null) return assetEntryOptions.filename;

      // the `filename` property of the `PathData` type should be a source file, but in entry this property not exists
      if (pathData.filename == null) {
        pathData.filename = assetEntryOptions.sourceFile;
      }

      let filename = isFunction(filenameTemplate) ? filenameTemplate(pathData, assetInfo) : filenameTemplate;
      if (assetEntryOptions.publicPath) {
        filename = path.posix.join(assetEntryOptions.publicPath, filename);
      }

      return filename;
    };

    assetEntryOptions.originalEntry = entry;

    this.entries.set(name, assetEntryOptions);
    this.entriesByResource.set(assetEntryOptions.id, assetEntryOptions);
  }

  /**
   * Add a script to webpack compilation.
   *
   * @param {string} name
   * @param {string} importFile The resource, including a query.
   * @param {string} filenameTemplate
   * @param {string} context
   * @param {string} issuer
   * @return {boolean} Return true if new file was added, if a file exists then return false.
   */
  static addToCompilation({ name, importFile, filenameTemplate, context, issuer }) {
    // skip duplicate entries
    if (this.#exists(name, importFile)) return false;

    const compilation = this.compilation;
    const compiler = compilation.compiler;
    const webpack = compiler.webpack;
    const { EntryPlugin } = webpack;
    const entryDependency = EntryPlugin.createDependency(importFile, { name });
    let [sourceFile] = importFile.split('?', 1);

    const issuerEntry = [...this.entries.values()].find(({ resource }) => resource === issuer);

    const entry = {
      name,
      runtime: undefined,
      // Note: the layer of JS added to the compilation must be the same as the entry ot its issuer.
      layer: issuerEntry.originalEntry.layer,
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
      id: undefined,
      name,
      filenameTemplate,
      filename: undefined,
      file: undefined,
      resource: importFile,
      importFile,
      sourceFile,
      sourcePath: context,
      outputPath: Options.getWebpackOutputPath(),
      verbose: false,
      isTemplate: false,
    };

    this.#add(entry, assetEntryOptions);
    this.compilationEntryNames.add(name);

    compilation.addEntry(context, entryDependency, entry, (err, module) => {
      if (err) throw new Error(err);
    });

    // add missing dependencies after rebuild
    if (PluginService.isWatchMode()) {
      new EntryPlugin(context, importFile, { name }).apply(compiler);
    }

    return true;
  }

  /**
   * Whether the file in the entry already exists.
   *
   * @param {string} name The name of the entry.
   * @param {string} importFile The resource, including a query.
   * @return {boolean}
   * @private
   */
  static #exists(name, importFile) {
    const entry = this.entries.get(name);
    return entry != null && entry.importFile === importFile;
  }

  /**
   * Clear caches.
   * Called only once when the plugin is applied.
   */
  static clear() {
    this.idIndex = 1;
    this.data.clear();
    this.entries.clear();
    this.entriesByResource.clear();
    this.entryFilenames.clear();
    this.entrySourceFiles.length = 0;
  }

  /**
   * Remove entries added not via webpack entry.
   * Called before each new compilation after changes, in the serve/watch mode.
   */
  static reset() {
    for (const entryName of this.compilationEntryNames) {
      const entry = this.entries.get(entryName);
      if (entry) {
        this.entriesByResource.delete(entry.id);
      }

      // TODO: find the use case where it was needed
      // not remove JS file added as the entry for compilation,
      // because after changes any style file imported in the JS file, the JS entry will not be processed
      // this.entries.delete(entryName);
    }

    this.compilationEntryNames.clear();
  }
}

module.exports = AssetEntry;
