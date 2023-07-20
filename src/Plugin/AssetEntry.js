const fs = require('fs');
const path = require('path');
const Options = require('./Options');
const PluginService = require('./PluginService');
const { isFunction, addQueryParam, deleteQueryParam, getQueryParam } = require('../Common/Helpers');
const { readDirRecursiveSync } = require('../Common/FileUtils');
const { optionEntryPathException } = require('./Messages/Exception');
const AssetTrash = require('./AssetTrash');

const loader = require.resolve('../Loader');

/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("webpack").Module} Module */
/** @typedef {import("webpack").Chunk} Chunk */
/** @typedef {import("webpack").EntryPlugin} EntryPlugin */
/** @typedef {import("webpack/Entrypoint").EntryOptions} EntryOptions */
/** @typedef {import("Collection")} Collection */

/**
 * @typedef {Object} AssetEntryOptions
 * @property {number=} id The unique Id of the entry template.
 *   The entries added to compilation have not Id.
 *   Note: the same source file of a template can be defined under many entry names.
 *   In this case the entry.resource is not unique und must be used entry.id.
 * @property {string} name The key of webpack entry.
 * @property {string|(function(PathData, AssetInfo): string)} filenameTemplate The filename template or function.
 * @property {string} filename The asset filename.
 *  The template strings support only these substitutions:
 *  [name], [base], [path], [ext], [id], [contenthash], [contenthash:nn]
 *  See https://webpack.js.org/configuration/output/#outputfilename
 *
 * @property {string=} assetFile The output asset file with relative path by webpack output path.
 *   Note: the method compilation.emitAsset() use this file as key of assets object
 *   and save the file relative by output path, defined in webpack.options.output.path.
 * @property {string} resource The absolute import file with query.
 * @property {string} importFile The original import entry file.
 * @property {string} sourceFile The absolute import file only w/o query.
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
  static entryIdKey = '_entryId';

  /** @type {Map<string, AssetEntryOptions>} */
  static entries = new Map();
  static entriesById = new Map();
  static compilationEntryNames = new Set();
  static entryFilenames = new Set();

  /** @type {Compilation} */
  static compilation = null;

  /** @type {Collection} */
  static Collection = null;

  static fs = null;

  /** @type {Object} */
  static entryLibrary = null;

  // the id to bind loader with data passed into template via entry.data
  static idIndex = 1;
  static data = new Map();

  // TODO:
  static removedEntries = new Set();

  /**
   * Inject dependencies.
   *
   * @param {Compilation} compilation
   * @param {Object} entryLibrary
   * @param {Collection} Collection
   */
  static init({ compilation, entryLibrary, Collection }) {
    this.compilation = compilation;
    this.entryLibrary = entryLibrary;
    this.Collection = Collection;
    this.fs = compilation.compiler.inputFileSystem.fileSystem;
  }

  static initEntry() {
    const { entry } = Options.webpackOptions;
    let pluginEntry;

    if (Options.isDynamicEntry()) {
      pluginEntry = this.getDynamicEntry();
    } else {
      pluginEntry = Options.options.entry;
      for (const key in pluginEntry) {
        const entry = pluginEntry[key];

        if (entry.import == null) {
          pluginEntry[key] = { import: [entry] };
          continue;
        }

        if (!Array.isArray(entry.import)) {
          entry.import = [entry.import];
        }
      }
    }

    Options.webpackOptions.entry = { ...entry, ...pluginEntry };
  }

  /**
   * Returns dynamic entries read recursively from the entry path.
   *
   * @return {Object}
   * @throws
   */
  static getDynamicEntry() {
    //const { fs } = this; // TODO: fix error
    const dir = Options.options.entry;

    try {
      if (!fs.lstatSync(dir).isDirectory()) optionEntryPathException(dir);
    } catch (error) {
      optionEntryPathException(dir);
    }

    const files = readDirRecursiveSync(dir, { fs, includes: [Options.options.test] });
    const entry = {};

    files.forEach((file) => {
      let outputFile = path.relative(dir, file);
      let key = outputFile.slice(0, outputFile.lastIndexOf('.'));
      entry[key] = { import: [file] };
    });

    return entry;
  }

  /**
   * Get current entry files from the cache.
   *
   * @return {Set<string>}
   */
  static getEntryFiles() {
    const files = new Set();

    for (let { sourceFile, isTemplate } of this.entries.values()) {
      if (isTemplate && !this.removedEntries.has(sourceFile)) files.add(sourceFile);
    }

    return files;
  }

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
  static isEntryFilename(filename) {
    return this.entryFilenames.has(filename);
  }

  /**
   * Whether the resource is a template entrypoint.
   *
   * @param {string} resource The resource file.
   * @return {boolean}
   */
  static isEntryResource(resource) {
    const [resourceFile] = resource.split('?', 1);
    for (let { isTemplate, sourceFile } of this.entries.values()) {
      if (isTemplate && sourceFile === resourceFile) return true;
    }

    return false;
  }

  /**
   * Whether the entry file was deleted or renamed in serve/watch mode.
   *
   * Webpack doesn't want to remove the entrypoint file from compilation permanently.
   * It is needed to ignore deleted file in hooks beforeResolve and renderManifest.
   *
   * @param {string} file The source entry file.
   * @return {boolean}
   */
  static isDeletedEntryFile(file) {
    return this.removedEntries.has(file);
  }

  /**
   * Get an entry object by name.
   *
   * @param {string} name The entry name.
   * @returns {AssetEntryOptions|null}
   */
  static get(name) {
    const entry = this.entries.get(name);

    if (entry && PluginService.isWatchMode() && Options.isDynamicEntry() && this.isDeletedEntryFile(entry.resource)) {
      // delete artifacts from compilation
      AssetTrash.add(entry.filename);
      AssetTrash.add(`${entry.name}.js`);
      return null;
    }

    return entry;
  }

  static getById(id) {
    return this.entriesById.get(Number(id));
  }

  /**
   * Returns the entry of a resource like style or script by its filename, regardless a query.
   * Note: To get the entry of a template use the get() by name.
   *
   * @param {string} resource
   * @return {AssetEntryOptions|null}
   */
  static getByResource(resource) {
    const [resourceFile] = resource.split('?', 1);

    for (let entry of this.entries.values()) {
      if (entry.sourceFile === resourceFile) return entry;
    }

    return null;
  }

  static getData(id) {
    return this.data.get(Number(id));
  }

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  static setCompilation(compilation) {
    this.compilation = compilation;
  }

  /**
   * Resolve the entry id in the request and save it in the Webpack data object.
   *
   * @param {Object} resolveData The data object.
   * @return {string|null}
   */
  static resolveEntryId(resolveData) {
    let entryId = getQueryParam(resolveData.request, this.entryIdKey);

    if (entryId) {
      entryId = Number(entryId);
      resolveData[this.entryIdKey] = entryId;

      // delete temporary entry id param form request query of the entry
      resolveData.request = deleteQueryParam(resolveData.request, this.entryIdKey);
    }

    return entryId || null;
  }

  /**
   * @param {Module} module The Webpack module object.
   * @param {Object} resolveData The data object.
   */
  static connectEntryAndModule(module, resolveData) {
    const entryId = resolveData[this.entryIdKey];

    module[this.entryIdKey] = entryId;

    if (entryId) {
      // when used the same template file for many pages,
      // add the unique entry id to the query of the loader url to be sure that module request is unique;
      // when many Webpack entries have the same module request, then Webpack will not
      module.request = module.request.replace(loader, loader + `?entryId=${entryId}`);
    }
  }

  /**
   * @param {Module} module The Webpack module object.
   * @return {number|null} Return an entry id if the module is an entry, otherwise return null.
   */
  static getEntryId(module) {
    return module[this.entryIdKey] || null;
  }

  /**
   * @param {Number} id
   * @param {Object} entry
   */
  static setEntryId(id, entry) {
    // add the entry id as the query parameter
    entry.import[0] = addQueryParam(entry.import[0], this.entryIdKey, id);
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

  /**
   * @param {AssetEntryOptions} entry
   */
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
   */
  static addEntries(entries) {
    for (let name in entries) {
      const entry = entries[name];
      const importFile = entry.import[0];
      let resource = importFile;
      let [sourceFile] = resource.split('?', 1);
      let options = Options.getEntryOptions(sourceFile);

      if (options == null) continue;

      let { verbose, filename: filenameTemplate, sourcePath, outputPath } = options;

      // Note:
      // when the entry contains the same source file for many chunks,
      // add a unique identifier of the entry to execute a loader for all templates,
      // otherwise Webpack call a loader only for the first template.
      // See 'webpack/lib/NormalModule.js:identifier()'.
      // For example, there is the entry containing many pages based on the same template:
      // {
      //   page1: { import: 'src/template.html', data: { title: 'A'} },
      //   page2: { import: 'src/template.html', data: { title: 'B'} },
      // }

      // Note: the id for all entry dependencies must be the same
      let id = this.idIndex++;

      this.setEntryId(id, entry);
      //entry.layer = '1';

      if (!entry.library) entry.library = this.entryLibrary;
      if (entry.filename) filenameTemplate = entry.filename;
      if (entry.data) this.data.set(id, entry.data);

      if (!path.isAbsolute(sourceFile)) {
        resource = path.join(sourcePath, resource);
        sourceFile = path.join(sourcePath, sourceFile);
        entry.import[0] = path.join(sourcePath, entry.import[0]);
      }

      /** @type {AssetEntryOptions} */
      const assetEntryOptions = {
        id,
        name,
        filenameTemplate,
        filename: undefined,
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

      this.#add(entry, assetEntryOptions);
    }
  }

  /**
   * Add the entry file to compilation.
   *
   * Called after changes in serve/watch mode.
   *
   * @param {string} file
   */
  static addEntry(file) {
    const context = Options.options.sourcePath;
    const entryDir = Options.options.entry;

    if (!path.isAbsolute(file)) {
      file = path.join(Options.rootContext, file);
    }

    let outputFile = path.relative(entryDir, file);
    let name = outputFile.slice(0, outputFile.lastIndexOf('.'));

    this.removedEntries.delete(file);

    if (this.#exists(name, file)) return;

    const entries = {};
    const entrypoint = { import: [file], filename: '[name].html' };

    entries[name] = entrypoint;
    this.addEntries(entries);
    Options.webpackOptions.entry = { ...Options.webpackOptions.entry, ...entries };

    // important: the library must be null
    entrypoint.library = null;

    const entryOptions = {
      name,
      runtime: undefined,
      //layer: '1',
      dependOn: undefined,
      baseUri: undefined,
      publicPath: undefined,
      chunkLoading: undefined,
      asyncChunks: undefined,
      wasmLoading: undefined,
      library: undefined,
    };

    const compilation = this.compilation;
    const compiler = compilation.compiler;
    const { EntryPlugin } = compiler.webpack;

    new EntryPlugin(context, file, entryOptions).apply(compiler);
  }

  /**
   * Remove the entry file from cache.
   *
   * Called after deleting of an entry file in serve/watch mode.
   *
   * @param {string} file
   */
  static deleteEntry(file) {
    this.removedEntries.add(file);
    this.Collection.deleteData(file);

    for (const [name, entry] of this.entries) {
      if (entry.resource === file) {
        // don't delete the entry from 'this.entries', it is used as the cache for the following use case:
        // in serve/watch mode after renaming an entry file in another name and rename the same file back in previous name,
        // will be used already created entry instead of the new entry
        // this.entries.delete(name);
        this.entryFilenames.delete(entry.filename);
      }
    }
  }

  static deleteMissingFile(file) {
    this.removedEntries.delete(file);
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
    if (this.#exists(name, importFile)) {
      return false;
    }

    let [sourceFile] = importFile.split('?', 1);
    const issuerEntry = [...this.entries.values()].find(({ resource }) => resource === issuer);

    const entryOptions = {
      name,
      runtime: undefined,
      //layer: '1',
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
      resource: importFile,
      importFile,
      sourceFile,
      sourcePath: context,
      outputPath: Options.getWebpackOutputPath(),
      verbose: false,
      isTemplate: false,
    };

    this.#add(entryOptions, assetEntryOptions);
    this.compilationEntryNames.add(name);

    const compilation = this.compilation;
    const compiler = compilation.compiler;
    const { EntryPlugin } = compiler.webpack;

    // TODO: add entry id as query in importFile
    const entryDependency = EntryPlugin.createDependency(importFile, { name });

    compilation.addEntry(context, entryDependency, entryOptions, (err, module) => {
      if (err) throw new Error(err);
    });

    // add missing dependencies after rebuild
    if (PluginService.isWatchMode()) {
      new EntryPlugin(context, importFile, { name }).apply(compiler);
    }

    return true;
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
    this.entriesById.set(assetEntryOptions.id, assetEntryOptions);
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
    this.entriesById.clear();
    this.entryFilenames.clear();
  }

  /**
   * Remove entries added not via webpack entry.
   * Called before each new compilation after changes, in the serve/watch mode.
   */
  static reset() {
    for (const entryName of this.compilationEntryNames) {
      const entry = this.entries.get(entryName);
      if (entry) {
        this.entriesById.delete(entry.id);
      }

      // not remove JS file added as the entry for compilation,
      // because after changes any style file imported in the JS file, the JS entry will not be processed
      // this.entries.delete(entryName);
    }

    this.compilationEntryNames.clear();
  }
}

module.exports = AssetEntry;
