const path = require('path');
const { isFunction, addQueryParam, deleteQueryParam, getQueryParam } = require('../Common/Helpers');
const { readDirRecursiveSync } = require('../Common/FileUtils');
const { optionEntryPathException } = require('./Messages/Exception');
const PluginService = require('./PluginService');

const loader = require.resolve('../Loader');

/** @typedef {import('webpack').Compilation} Compilation */
/** @typedef {import('webpack').Module} Module */
/** @typedef {import('webpack').Chunk} Chunk */
/** @typedef {import('webpack').EntryPlugin} EntryPlugin */
/** @typedef {import('webpack/Entrypoint').EntryOptions} EntryOptions */

/** @typedef {import('Collection')} Collection */

/**
 * @typedef {Object} AssetEntryOptions
 * @property {number=} id The unique ID of the entry template.
 *   The entries added to compilation have not ID.
 *   Note: the same source file of a template can be defined under many entry names.
 *   In this case, the 'entry.resource' is not unique und must be used entry.id.
 * @property {string} name The webpack entry name used for compilation. Use `originalName` as the real name.
 * @property {string} originalName The original name of webpack entry.
 * @property {string|(function(PathData, AssetInfo): string)} filenameTemplate The filename template or function.
 * @property {string} filename The asset filename.
 *  The template strings support only these substitutions:
 *  [name], [base], [path], [ext], [id], [contenthash], [contenthash:nn]
 *  See https://webpack.js.org/configuration/output/#outputfilename
 * @property {Function} filenameFn The function to generate the output filename dynamically.
 * @property {string} resource The absolute import file with a query.
 * @property {string} importFile The original import entry file.
 * @property {string} sourceFile The absolute import file only w/o a query.
 * @property {string|undefined} dataFile The absolute file containing variables passed into the entry template.
 * @property {string} sourcePath The path where are source files.
 * @property {string} outputPath The absolute output path.
 * @property {string} publicPath The public path relative to outputPath.
 * @property {{name: string, type: string}} library Define the output a js file.
 *  See https://webpack.js.org/configuration/output/#outputlibrary
 * @property {boolean|string} [verbose = false] Show an information by handles of the entry in a postprocess.
 * @property {boolean} isTemplate Whether the entry is a template entrypoint.
 * @property {boolean} isStyle Whether the entry is a style defined in Webpack entry.
 */

class AssetEntry {
  /** @type {Map<string, AssetEntryOptions>} */
  entriesByName = new Map();

  /** @type {Map<Number, AssetEntryOptions>} */
  entriesById = new Map();

  compilationEntryNames = new Set();
  removedEntries = new Set();

  /** @type {Object} */
  entryLibrary = null;

  /** @type {FileSystem} */
  fs = null;

  /** @type {Compiler} */
  compiler = null;

  /** @type {Compilation} */
  compilation = null;

  /** @type {Collection} */
  collection = null;

  /** @type {{}} */
  pluginOption = null;

  assetTrash = null;

  /** @type {Map<any, any>} The data passed to the entry template. */
  data = new Map();

  // the id to bind loader with data passed into template via entry.data
  idIndex = 1;
  entryIdKey = '_entryId';
  // the regexp will be initialized in the init()
  entryIdRegexp = null;

  // the entry name prefix of html entries to avoid a collision with the same name of a js entrypoint,
  // e.g., index.html and index.js have the same base name `index`,
  // but must be defined in entry as two different entries, because each type of entry have own options:
  // entry: { __prefix__index: './index.html', index: './index.js' }
  entryNamePrefix = '__bundler-plugin-entry__';

  /**
   * Unique last index for each file with the same name.
   * @type {Object<file: string, index: number>}
   */
  uniqueEntryNameIndex = {};

  /**
   *
   * @param {{}} pluginOption
   * @param {Collection} collection
   * @param {AssetTrash} assetTrash
   * @param {{}} entryLibrary
   */
  constructor({ pluginOption, collection, assetTrash, entryLibrary }) {
    this.pluginOption = pluginOption;
    this.collection = collection;
    this.assetTrash = assetTrash;
    this.entryLibrary = entryLibrary;

    this.entryIdRegexp = new RegExp(`\\?${this.entryIdKey}=(\\d+)`);
  }

  /**
   * Init the asset entry.
   *
   * @param {{}} pluginOption
   *
   *
   * @param {FileSystem} fs
   */
  init({ fs }) {
    this.fs = fs;

    const { entry } = this.pluginOption.webpackOptions;
    let pluginEntry;

    if (this.pluginOption.isDynamicEntry()) {
      pluginEntry = this.getDynamicEntry();
      this.pluginOption.webpackOptions.entry = { ...entry, ...pluginEntry };
      return;
    }

    pluginEntry = { ...entry, ...this.pluginOption.get().entry };

    for (let name in pluginEntry) {
      const entry = pluginEntry[name];
      const entryName = this.createEntryName(name);

      if (entry.import == null) {
        if (this.pluginOption.isEntry(entry)) {
          delete pluginEntry[name];
          name = entryName;
        }

        pluginEntry[name] = { import: [entry] };

        continue;
      }

      if (!Array.isArray(entry.import)) {
        entry.import = [entry.import];
      }

      if (this.pluginOption.isEntry(entry.import[0])) {
        pluginEntry[entryName] = entry;
        delete pluginEntry[name];
      }
    }

    this.pluginOption.webpackOptions.entry = pluginEntry;
  }

  /**
   * Returns dynamic entries read recursively from the entry path.
   *
   * @return {Object}
   * @throws
   */
  getDynamicEntry() {
    const { fs } = this;
    const dir = this.pluginOption.get().entry;
    const { includes: filterIncludes, excludes, fn: filterFn } = this.pluginOption.getEntryFilter();
    const includes = filterIncludes.length ? filterIncludes : [this.pluginOption.get().test];

    try {
      if (!fs.lstatSync(dir).isDirectory()) optionEntryPathException(dir);
    } catch (error) {
      optionEntryPathException(dir);
    }

    const files = readDirRecursiveSync(dir, { fs, includes, excludes });
    const entry = {};

    files.forEach((file) => {
      if (filterFn(file) === false) {
        return;
      }

      const outputFile = path.relative(dir, file);
      const name = outputFile.slice(0, outputFile.lastIndexOf('.'));
      const entryName = this.createEntryName(name);
      entry[entryName] = { import: [file] };
    });

    return entry;
  }

  /**
   * @param {string} name
   * @return {string}
   */
  createEntryName(name) {
    return `${this.entryNamePrefix}${name}`;
  }

  /**
   * @param {string} name
   * @return {string}
   */
  getOriginalEntryName(name) {
    return name.replace(this.entryNamePrefix, '');
  }

  /**
   * Get current entry files from the cache.
   *
   * @return {Set<string>}
   */
  getEntryFiles() {
    const files = new Set();

    for (let { sourceFile, isTemplate } of this.entriesByName.values()) {
      if (isTemplate && !this.removedEntries.has(sourceFile)) files.add(sourceFile);
    }

    return files;
  }

  /**
   * Whether the output filename is a template entrypoint.
   *
   * @param {string} filename The output filename.
   * @return {boolean}
   */
  isEntryFilename(filename) {
    return this.collection.isTemplate(filename);
  }

  /**
   * Whether the resource is a template entrypoint.
   *
   * @param {string} resource The resource file.
   * @return {boolean}
   */
  isEntryResource(resource) {
    const [resourceFile] = resource.split('?', 1);
    for (let { isTemplate, sourceFile } of this.entriesByName.values()) {
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
  isDeletedEntryFile(file) {
    return this.removedEntries.has(file);
  }

  /**
   * Get an entry object by chunk.
   *
   * Note: the `chunk.filenameTemplate` will be recovered
   * because the webpack sets it as undefined in the watch mode after changes.
   *
   * Called in `renderManifest` hook.
   *
   * @param {Chunk} chunk The webpack chunk.
   * @returns {AssetEntryOptions|null}
   */
  getByChunk(chunk) {
    const entry = this.entriesByName.get(chunk.name);

    if (entry == null) return null;

    if (
      PluginService.isWatchMode(this.compiler) &&
      this.pluginOption.isDynamicEntry() &&
      this.isDeletedEntryFile(entry.sourceFile)
    ) {
      // delete artifacts from compilation in serve/watch mode
      this.assetTrash.add(entry.filename);
      this.assetTrash.add(`${entry.name}.js`);

      return null;
    }

    if (entry.isTemplate) {
      entry.filename = this.compilation.getAssetPath(entry.filenameTemplate, {
        // define the structure of the pathData argument with useful data for the filenameTemplate as a function
        runtime: entry.originalName,
        filename: entry.sourceFile,
        filenameTemplate: entry.filenameTemplate,
        chunk: {
          name: entry.originalName,
          runtime: entry.originalName,
        },
      });

      if (entry.publicPath) {
        entry.filename = path.posix.join(entry.publicPath, entry.filename);
      }

      return entry;
    }

    // set generated output filename for the CSS asset defined as an entrypoint
    if (entry.isStyle) {
      entry.filename = this.compilation.getPath(chunk.filenameTemplate, {
        contentHashType: 'javascript',
        chunk,
      });

      return entry;
    }

    // fix undefined `pathData.filename` in the watch mode after changes when the `js.filename` is a function
    if (chunk.filenameTemplate == null && typeof entry.filenameTemplate === 'function') {
      chunk.filenameTemplate = entry.filenameFn;
    }

    return entry;
  }

  /**
   * @param {string|number} id
   * @returns {AssetEntryOptions}
   */
  getById(id) {
    return this.entriesById.get(Number(id));
  }

  /**
   * Returns the entry of a resource like style or script by its filename, regardless a query.
   * Note: To get the entry of a template use the get() by name.
   *
   * @param {string} resource
   * @return {AssetEntryOptions|null}
   */
  getByResource(resource) {
    const [resourceFile] = resource.split('?', 1);

    for (let entry of this.entriesByName.values()) {
      if (entry.sourceFile === resourceFile) return entry;
    }

    return null;
  }

  /**
   * Get entry data.
   *
   * @param {string|Number} id The entry id.
   * @return {Object}
   */
  getData(id) {
    return this.data.get(Number(id)) || {};
  }

  /**
   * Resolve the entry id in the request and save it in the Webpack data object.
   *
   * @param {Object} resolveData The data object.
   * @return {number|null}
   */
  resolveEntryId(resolveData) {
    let entryId = getQueryParam(resolveData.request, this.entryIdKey);

    if (entryId) {
      entryId = Number(entryId);

      // delete temporary entry id param form request query of the entry
      resolveData.request = deleteQueryParam(resolveData.request, this.entryIdKey);
    }

    return entryId || null;
  }

  /**
   * Retrieve `entryId` from request of the module.
   * The request format is /path/to/loader/index.js?entryId=1!/path/to/template.
   *
   * @param {Module} module The Webpack module.
   * @return {number|undefined}
   */
  getEntryId(module) {
    const [, entryId] = this.entryIdRegexp.exec(module.request);

    return entryId ? Number(entryId) : undefined;
  }

  /**
   * @param {Module} module The Webpack module object.
   * @param {Object} resolveData The data object.
   */
  connectEntryAndModule(module, resolveData) {
    const { entryId, _bundlerPluginMeta: meta } = resolveData;

    if (entryId) {
      // When used the same template file for many pages,
      // add the unique entry id to the query of the loader url to be sure that module request is unique.
      // When many Webpack entries have the same module request, then Webpack will not create a new module.
      module.request = module.request.replace(loader, loader + `?${this.entryIdKey}=${entryId}`);
    }

    // Note: the module.resourceResolveData is cached in the serve mode,
    // therefore, we can't save the entry id in the resourceResolveData.
    // E.g.: when there are many entries with the same template file but with different data,
    // then in serve/watch mode the resourceResolveData has the reference to the last object,
    // which is unique by module.resource, not by module.request.
    module.resourceResolveData._bundlerPluginMeta = meta;
  }

  /**
   * @param {Number} id
   * @param {Object} entry
   */
  setEntryId(id, entry) {
    // add the entry id as the query parameter
    entry.import[0] = addQueryParam(entry.import[0], this.entryIdKey, id);
  }

  /**
   * @param {Compiler} compiler The instance of the webpack compiler.
   */
  setCompiler(compiler) {
    this.compiler = compiler;
  }

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  setCompilation(compilation) {
    this.compilation = compilation;
  }

  /**
   * @param {Array<Object>} entries
   */
  addEntries(entries) {
    for (let name in entries) {
      const entry = entries[name];
      const originalName = this.getOriginalEntryName(name);
      const importFile = entry.import[0];
      let resource = importFile;
      let [sourceFile] = resource.split('?', 1);
      let options = this.pluginOption.getEntryOptions(sourceFile);

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

      if (!entry.library) entry.library = this.entryLibrary;
      if (entry.filename) filenameTemplate = entry.filename;
      if (entry.data) this.data.set(id, entry.data);

      if (!path.isAbsolute(sourceFile)) {
        resource = path.join(sourcePath, resource);
        sourceFile = path.join(sourcePath, sourceFile);
        entry.import[0] = path.join(sourcePath, entry.import[0]);
      }

      let dataFile = undefined;
      if (typeof entry.data === 'string') {
        dataFile = PluginService.resolveFile(this.compiler, entry.data);
      }

      /** @type {AssetEntryOptions} */
      const assetEntryOptions = {
        id,
        name,
        originalName,
        filenameTemplate,
        filename: undefined,
        resource,
        importFile,
        sourceFile,
        dataFile,
        sourcePath,
        outputPath,
        publicPath: '',
        library: entry.library,
        verbose,
        isTemplate: this.pluginOption.isEntry(sourceFile),
        isStyle: this.pluginOption.isStyle(sourceFile),
      };

      this.#cacheEntry(assetEntryOptions);
      this.#setFilename(entry, assetEntryOptions);
    }
  }

  /* istanbul ignore next: this method is called in watch mode after changes */
  /**
   * Add the entry file to compilation.
   *
   * Called after changes in serve/watch mode.
   *
   * @param {string} file
   */
  addEntry(file) {
    const pluginOptions = this.pluginOption.get();
    const context = pluginOptions.sourcePath;
    const entryDir = pluginOptions.entry;

    if (!path.isAbsolute(file)) {
      file = path.join(this.pluginOption.context, file);
    }

    let outputFile = path.relative(entryDir, file);
    let name = outputFile.slice(0, outputFile.lastIndexOf('.'));

    this.removedEntries.delete(file);

    if (this.#hasEntry(name, file)) return;

    const entries = {};
    const entrypoint = { import: [file], filename: '[name].html' };

    entries[name] = entrypoint;
    this.addEntries(entries);
    this.pluginOption.webpackOptions.entry = { ...this.pluginOption.webpackOptions.entry, ...entries };

    // important: the library must be null
    entrypoint.library = null;

    const entryOptions = {
      name,
      runtime: undefined,
      dependOn: undefined,
      baseUri: undefined,
      publicPath: undefined,
      chunkLoading: undefined,
      asyncChunks: undefined,
      wasmLoading: undefined,
      library: undefined,
    };

    const compiler = this.compiler;
    const { EntryPlugin } = compiler.webpack;

    // the entry request is generated as the `entrypoint.import` property after call the addEntries()
    new EntryPlugin(context, entrypoint.import[0], entryOptions).apply(compiler);
  }

  /* istanbul ignore next: this method is called in watch mode after changes */
  /**
   * Remove the entry file from cache.
   *
   * Called after deleting of an entry file in serve/watch mode.
   *
   * @param {string} file
   */
  deleteEntry(file) {
    this.removedEntries.add(file);
    this.collection.deleteData(file);

    // don't delete the entry from 'this.entriesByName', it is used as the cache for the following use case:
    // in serve/watch mode after renaming an entry file in another name and rename the same file back in previous name,
    // will be used already created entry instead of the new entry
  }

  deleteMissingFile(file) {
    this.removedEntries.delete(file);
  }

  /**
   * Add a script to webpack compilation.
   *
   * @param {string|null} name The entry name.
   * @param {string} importFile The resource, including a query.
   * @param {string} filenameTemplate
   * @param {string} context
   * @param {string} issuer
   * @return {string} Return the unique entry name.
   */
  addToCompilation({ name, importFile, filenameTemplate, context, issuer }) {
    name = this.#getUniqueEntryName(name, importFile);

    // skip duplicate entries
    if (this.#hasEntry(name, importFile)) {
      return name;
    }

    const compiler = this.compiler;
    const compilation = this.compilation;
    let [sourceFile] = importFile.split('?', 1);

    const entryOptions = {
      name,
      runtime: undefined,
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
      outputPath: this.pluginOption.getWebpackOutputPath(),
      verbose: false,
      isTemplate: false,
    };

    const { EntryPlugin } = compiler.webpack;
    const entryDependency = EntryPlugin.createDependency(importFile, { name });

    this.#cacheEntry(assetEntryOptions);
    this.compilationEntryNames.add(name);

    compilation.addEntry(context, entryDependency, entryOptions, (error, module) => {
      if (error) {
        throw new Error(error.toString());
      }

      // fix #143: if the same entry already exists, it caused Webpack error:
      // "Conflicting entry option filename () => {...} vs () => {...}".
      // This is a Webpack issue, occurs unpredictably, after a random number of runs
      // when the sequence of processing modules is changed sporadically.
      if (module) {
        // assign a custom filename function only after the module has been successfully created
        this.#setFilename(entryOptions, assetEntryOptions);
      }
    });

    // add missing dependencies after rebuild
    if (PluginService.isWatchMode(compiler)) {
      new EntryPlugin(context, importFile, { name }).apply(compiler);
    }

    return name;
  }

  /**
   * @param {string|null} name The entry name.
   * @param {string} file The source file.
   * @return {string } Return unique entry name.
   */
  #getUniqueEntryName(name, file) {
    if (!name) {
      name = path.parse(file).name;
    }

    let uniqueName = name;
    let hasEntry = this.compilation.entries.has(name);

    // the entrypoint name must be unique, if already exists then add an index: `main` => `main.1`, etc.
    if (hasEntry) {
      // create unique name
      if (!this.uniqueEntryNameIndex[name]) {
        this.uniqueEntryNameIndex[name] = 1;
      }
      uniqueName += '.' + this.uniqueEntryNameIndex[name]++;
    }

    return uniqueName;
  }

  /**
   * Sets the filename as a function for a given entry.
   * This function processes the filename template and applies adjustments.
   *
   * @param {EntryOptions} entry The Webpack entry option object.
   * @param {AssetEntryOptions} assetEntryOptions
   */
  #setFilename(entry, assetEntryOptions) {
    const { originalName, filenameTemplate, outputPath } = assetEntryOptions;

    if (path.isAbsolute(outputPath)) {
      assetEntryOptions.publicPath = path.relative(this.pluginOption.getWebpackOutputPath(), outputPath);
    }

    const filenameFn = (pathData, assetInfo) => {
      // the template filename stays the same after changes in watch mode because have not a hash substitution
      if (assetEntryOptions.isTemplate && assetEntryOptions.filename != null) return assetEntryOptions.filename;

      let filename = filenameTemplate;

      if (isFunction(filenameTemplate)) {
        // type PathData: https://webpack.js.org/configuration/output/#template-strings
        // clone the pathData object to modify the chunk object w/o side effects in the main compilation
        const pathDataCloned = { ...pathData };
        pathDataCloned.chunk = { ...pathDataCloned.chunk };
        if (originalName) {
          pathDataCloned.chunk.name = originalName;
          pathDataCloned.chunk.runtime = originalName;
        }

        // the `filename` property of the `PathData` type should be a source file, but in entry this property not exists
        if (pathDataCloned.filename == null) {
          pathDataCloned.filename = assetEntryOptions.sourceFile;
        }
        // note: resource is full path including URL queries
        // TODO: undocumented non-standard additional property, should be perhaps into filename?
        pathDataCloned.resource = assetEntryOptions.resource;

        filename = filenameTemplate(pathDataCloned, assetInfo);
      }

      if (assetEntryOptions.publicPath) {
        filename = path.posix.join(assetEntryOptions.publicPath, filename);
      }

      return filename;
    };

    entry.filename = assetEntryOptions.filenameFn = filenameFn;
  }

  /**
   * Save already added entry to cache.
   *
   * @param {AssetEntryOptions} assetEntryOptions
   */
  #cacheEntry(assetEntryOptions) {
    const { name, id } = assetEntryOptions;

    this.entriesByName.set(name, assetEntryOptions);
    this.entriesById.set(id, assetEntryOptions);
  }

  /**
   * Whether the file in the entry already exists.
   *
   * @param {string} name The name of the entry.
   * @param {string} importFile The resource, including a query.
   * @return {boolean}
   * @private
   */
  #hasEntry(name, importFile) {
    const entry = this.entriesByName.get(name);

    return entry != null && entry.importFile === importFile;
  }

  /**
   * Clear caches.
   * Called only once when the plugin is applied.
   */
  clear() {
    this.uniqueEntryNameIndex = {};
    this.idIndex = 1;
    this.data.clear();
    this.entriesByName.clear();
    this.entriesById.clear();
  }

  /**
   * Remove entries added not via webpack entry.
   * Called before each new compilation after changes, in the serve/watch mode.
   */
  reset() {
    // don't clear the uniqueEntryNameIndex
    // test case:
    // there are 3 entries: home.html, news.html and about.html
    // 1. add the `script.js` to the home.html => script.js
    // 2. add the `script.js` to the news.html => script.1.js
    // 3. add the `script.js` to the about.html => script.2.js
    // but when the index is cleared, then after adding the file with the same name will be not unique
    // and is generated a js file having a wrong content
    //this.uniqueEntryNameIndex = {};

    for (const entryName of this.compilationEntryNames) {
      const entry = this.entriesByName.get(entryName);
      if (entry) {
        this.entriesById.delete(entry.id);
      }

      // not remove JS file added as the entry for compilation,
      // because after changes any style file imported in the JS file, the JS entry will not be processed
      // this.entriesByName.delete(entryName);
    }

    this.compilationEntryNames.clear();
  }
}

module.exports = AssetEntry;
