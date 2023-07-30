const path = require('path');

//const JavascriptParser = require('webpack/lib/javascript/JavascriptParser');
//const JavascriptGenerator = require('webpack/lib/javascript/JavascriptGenerator');

const { pluginName } = require('../config');
const { baseUri, urlPathPrefix } = require('../Loader/Utils');
const { isDir } = require('../Common/FileUtils');

const CssExtractModule = require('./Modules/CssExtractModule');
const Options = require('./Options');
const PluginService = require('./PluginService');
const Collection = require('./Collection');
const Resolver = require('./Resolver');
const Snapshot = require('./Snapshot');
const UrlDependency = require('./UrlDependency');

const Asset = require('./Asset');
const AssetEntry = require('./AssetEntry');
const AssetResource = require('./AssetResource');
const AssetInline = require('./AssetInline');
const AssetTrash = require('./AssetTrash');
const VMScript = require('./VMScript');

const { compilationName, verbose } = require('./Messages/Info');

// the loader must have the structure
const cssLoader = {
  loader: require.resolve('../Loader/cssLoader.js'),
  type: undefined,
  options: undefined,
  ident: undefined,
};

/** @typedef {import('webpack/declarations/WebpackOptions').Output} WebpackOutputOptions */
/** @typedef {import('webpack').Compiler} Compiler */
/** @typedef {import('webpack').Compilation} Compilation */
/** @typedef {import('webpack').ChunkGraph} ChunkGraph */
/** @typedef {import('webpack').Chunk} Chunk */
/** @typedef {import('webpack').Module} Module */
/** @typedef {import('webpack').sources.Source} Source */
/** @typedef {import('webpack-sources').RawSource} RawSource */
/** @typedef {import('webpack').Configuration} Configuration */
/** @typedef {import('webpack').PathData} PathData */
/** @typedef {import('webpack').AssetInfo} AssetInfo */

/**
 * @typedef {Object} ModuleOptions
 * @property {RegExp} test RegEx to match templates as entry points.
 * @property {boolean} [enabled = true] Enable/disable the plugin.
 * @property {boolean|string} [verbose = false] Show the information at processing entry files.
 * @property {string} [sourcePath = options.context] The absolute path to sources.
 * @property {string} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} filename The file name of output file.
 * @property {function(string, ResourceInfo, Compilation): string|null =} postprocess The postprocess for extracted content from entry.
 * @property {function(compilation: Compilation, {source: string, assetFile: string, inline: boolean} ): string|null =} extract
 */

/**
 * @typedef {ModuleOptions} ModuleProps
 * @property {boolean} [`inline` = false] Whether inline CSS should contain an inline source map.
 */

/**
 * @typedef {Object} ResourceInfo
 * @property {boolean} isEntry True if is the asset from entry, false if asset is required from template.
 * @property {boolean} verbose Whether information should be displayed.
 * @property {string|(function(PathData, AssetInfo): string)} filename The filename template or function.
 * @property {string} sourceFile The absolute path to source file.
 * @property {string} outputPath The absolute path to output directory of asset.
 * @property {string} assetFile The output asset file relative by outputPath.
 */

/**
 * @typedef {Object} FileInfo
 *
 * @property {string} resource The resource file, including a query.
 * @property {string|undefined} filename The output filename.
 */

let HotUpdateChunk;

class AssetCompiler {
  entryLibrary = {
    name: 'return',
    type: 'jsonp', // compiles JS from source into HTML string via Function()
  };

  /** @type AssetEntryOptions The current entry point during dependency compilation. */
  currentEntryPoint;

  /** @type Set<Error> Buffered exceptions thrown in hooks. */
  exceptions = new Set();

  isSnapshotInitialized = false;

  /** @type {FileSystem} */
  fs = null;

  /** @type {Compilation} */
  compilation = null;

  /**
   * @param {PluginOptions|{}} options
   */
  constructor(options = {}) {
    Options.init(options, { AssetEntry });

    // let know the loader that the plugin is being used
    PluginService.init(Options);

    // bind the instance context for using these methods as references in Webpack hooks
    this.invalidate = this.invalidate.bind(this);
    this.afterProcessEntry = this.afterProcessEntry.bind(this);
    this.beforeResolve = this.beforeResolve.bind(this);
    this.afterCreateModule = this.afterCreateModule.bind(this);
    this.beforeLoader = this.beforeLoader.bind(this);
    this.afterBuildModule = this.afterBuildModule.bind(this);
    this.renderManifest = this.renderManifest.bind(this);
    this.afterProcessAssets = this.afterProcessAssets.bind(this);
    this.filterAlternativeRequests = this.filterAlternativeRequests.bind(this);
    this.done = this.done.bind(this);
  }

  /**
   * Called when a compiler object is initialized.
   * Abstract method should be overridden in child class.
   *
   * @param {Compiler} compiler The instance of the webpack compiler.
   * @abstract
   */
  initialize(compiler) {}

  /**
   * Called after asset sources have been rendered in the next 'processAssets' stage.
   *
   * Abstract method should be overridden in child class.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @return {Promise|undefined} Return the promise or undefined.
   * @abstract
   * @async
   */
  afterRenderModules(compilation) {}

  /**
   * Called after the processAssets hook had finished without an error.
   * Abstract method should be overridden in child class.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @param {string} sourceFile The resource file of the template.
   * @param {string} assetFile The template output filename.
   * @param {string} content The template content.
   * @return {string|undefined}
   * @abstract
   */
  afterProcess(compilation, { sourceFile, assetFile, content }) {}

  /**
   * Apply plugin.
   * @param {{}} compiler
   */
  apply(compiler) {
    if (!Options.isEnabled()) return;

    const { webpack } = compiler;
    const { NormalModule } = webpack;

    this.fs = compiler.inputFileSystem.fileSystem;
    this.webpack = webpack;
    HotUpdateChunk = webpack.HotUpdateChunk;

    Options.initWebpack(compiler.options);
    Options.enableLibraryType(this.entryLibrary.type);
    AssetResource.init(compiler);

    this.initialize(compiler);

    // clear caches by tests for webpack serve/watch
    AssetEntry.clear();
    AssetInline.clear();
    Collection.clear();
    Resolver.clear();
    Snapshot.clear();

    // executes by watch/serve only, before the compilation
    compiler.hooks.watchRun.tap(pluginName, (compiler) => {
      Options.initWatchMode();
      PluginService.setWatchMode(true);
      PluginService.watchRun();
    });

    // entry option
    AssetEntry.initEntry();
    compiler.hooks.entryOption.tap(pluginName, this.afterProcessEntry);

    // watch changes for entry-points
    compiler.hooks.invalid.tap(pluginName, this.invalidate);

    // for debugging
    // compiler.hooks.make.tapAsync(pluginName, (compilation, callback) => {
    //   callback();
    // });

    // this compilation
    compiler.hooks.thisCompilation.tap(pluginName, (compilation, { normalModuleFactory, contextModuleFactory }) => {
      const fs = this.fs;
      const normalModuleHooks = NormalModule.getCompilationHooks(compilation);

      this.compilation = compilation;

      AssetEntry.init({ compilation, entryLibrary: this.entryLibrary, Collection });

      Resolver.init({
        fs,
        rootContext: Options.rootContext,
      });

      UrlDependency.init({
        fs,
        moduleGraph: compilation.moduleGraph,
      });

      Collection.setCompilation(compilation);

      // resolve modules
      normalModuleFactory.hooks.beforeResolve.tap(pluginName, this.beforeResolve);
      contextModuleFactory.hooks.alternativeRequests.tap(pluginName, this.filterAlternativeRequests);

      // build modules
      normalModuleFactory.hooks.module.tap(pluginName, this.afterCreateModule);
      compilation.hooks.buildModule.tap(pluginName, this.beforeBuildModule);
      compilation.hooks.succeedModule.tap(pluginName, this.afterBuildModule);

      // called after the succeedModule hook but right before the execution of a loader
      normalModuleHooks.loader.tap(pluginName, this.beforeLoader);

      // for debugging
      // normalModuleHooks.beforeLoaders.tap(pluginName, (loaders, module, loaderContext) => {});
      // normalModuleHooks.beforeParse.tap(pluginName, (module) => {});
      // normalModuleHooks.beforeSnapshot.tap(pluginName, (module) => {});

      // render source code of modules
      compilation.hooks.renderManifest.tap(pluginName, this.renderManifest);

      // after render module's sources
      // note:
      // - only here is possible to modify an asset content via async function
      // - `Infinity` ensures that the process will be run after all optimizations
      compilation.hooks.processAssets.tapPromise({ name: pluginName, stage: Infinity }, (assets) => {
        // minify html before injecting inlined js and css to avoid:
        // - needles minification already minified assets in production mode
        // - issues by parsing the inlined js/css code with the html minification module
        const result = this.afterRenderModules(compilation);

        // TODO: calc real content hash for js and css, currently it is impossible
        // if (Options.isRealContentHash()) {
        // }

        return Promise.resolve(result);
      });

      // postprocess for the content of assets
      compilation.hooks.afterProcessAssets.tap(pluginName, (assets) => {
        // this hook doesn't provide testable exceptions, therefore, save an exception to throw it in the done hook

        try {
          this.afterProcessAssets(assets);
        } catch (error) {
          this.exceptions.add(error);
        }
      });
    });

    // after this compilation
    compiler.hooks.afterCompile.tap(pluginName, (compilation, callback) => {});

    compiler.hooks.done.tap(pluginName, this.done);
    compiler.hooks.shutdown.tap(pluginName, this.shutdown);
    compiler.hooks.watchClose.tap(pluginName, this.shutdown);
  }

  /**
   * Invalidate changed file.
   *
   * Called in serve/watch mode.
   *
   * Limitation: currently supports for change only a single file.
   *
   * TODO: add supports to add/remove many files.
   *      The problem: if added/removed many files,
   *      then webpack calls the 'invalid' hook many times, for each file separately.
   *      Research: find the hook, what called once, before the 'invalid' hook,
   *      to create the snapshot of files after change.
   *
   * @param {string} fileName The old filename before change.
   * @param {Number|null} changeTime
   */
  invalidate(fileName, changeTime) {
    const fs = this.fs;
    const entryDir = Options.getEntryPath();
    const isDirectory = isDir({ fs, file: fileName });

    Snapshot.create();

    if (isDirectory === true) return;

    const { actionType, newFileName, oldFileName } = Snapshot.detectFileChange();
    const isScript = Options.isScript(fileName);
    const inCollection = Collection.hasScript(fileName);
    const isEntryFile = (file) => file && file.startsWith(entryDir) && Options.isEntry(file);

    // 1. Invalidate entry file

    if (Options.isDynamicEntry() && (isEntryFile(fileName) || isEntryFile(oldFileName) || isEntryFile(newFileName))) {
      switch (actionType) {
        case 'modify':
          Collection.disconnectEntry(fileName);
          break;
        case 'add':
          AssetEntry.addEntry(newFileName);
          Collection.disconnectEntry(newFileName);
          break;
        case 'rename':
          AssetEntry.deleteEntry(oldFileName);
          AssetEntry.addEntry(newFileName);
          break;
        case 'remove':
          AssetEntry.deleteEntry(oldFileName);
          break;
        default:
          break;
      }

      return;
    }

    // 2. Invalidate a JavaScript file loaded in an entry template.

    if (actionType && isScript) {
      switch (actionType) {
        case 'add':
        // through
        case 'rename':
          const missingFiles = Snapshot.getMissingFiles();
          const { modules } = this.compilation;

          missingFiles.forEach((files, issuer) => {
            const missingFile = Array.from(files).find((file) => newFileName.endsWith(file));

            // if an already used js file was unlinked in html and then renamed
            if (!missingFile) return;

            for (const module of modules) {
              // the same template can be in many modules
              if (module.resource === issuer || module.resource === newFileName) {
                // reset errors for an unresolved js file, because the file can be renamed
                module._errors = [];

                // after rename a js file, try to rebuild the module of the entry file where the js file was linked
                this.compilation.rebuildModule(module, (err) => {
                  // after rebuild, remove the missing file to avoid double rebuilding by another exception
                  Snapshot.deleteMissingFile(issuer, missingFile);
                  AssetEntry.deleteMissingFile(missingFile);
                });
              }
            }
          });
          break;
        case 'remove':
          // do nothing
          break;
        default:
          break;
      }

      if (inCollection && (actionType === 'remove' || actionType === 'rename')) {
        AssetEntry.deleteEntry(oldFileName);
      }
    }
  }

  /**
   * Called after the entry configuration from webpack options has been processed.
   *
   * @param {string} context The base directory, an absolute path, for resolving entry points and loaders from the configuration.
   * @param {Object<name:string, entry: Object>} entries The webpack entries.
   */
  afterProcessEntry(context, entries) {
    AssetEntry.addEntries(entries);
  }

  /**
   * Filter alternative requests.
   *
   * Entry files should not have alternative requests.
   * If the template file contains require and is compiled with `compile` mode,
   * then ContextModuleFactory generates additional needless request as the relative path without a query.
   * Such 'alternative request' must be removed from compilation.
   *
   * @param {Array<{}>} requests
   * @param {{}} options
   * @return {Array|undefined} Returns only alternative requests not related to entry files.
   */
  filterAlternativeRequests(requests, options) {
    // skip the request required as 'asset/source' with the '?raw' resourceQuery
    // see https://webpack.js.org/guides/asset-modules/#replacing-inline-loader-syntax
    if (/\?raw/.test(options.resourceQuery)) return;

    return requests.filter((item) => !Options.isEntry(item.request));
  }

  /**
   * Called when a new dependency request is encountered.
   *
   * @param {Object} resolveData
   * @return {boolean|undefined} Return undefined to processing, false to ignore dependency.
   */
  beforeResolve(resolveData) {
    const { context, request, contextInfo, dependencyType } = resolveData;
    // note: the contextInfo.issuer is the filename w/o a query
    const { issuer } = contextInfo;
    const [file] = request.split('?', 1);

    AssetEntry.resolveEntryId(resolveData);

    // prevent compilation of renamed or deleted entry point in serve/watch mode
    if (Options.isDynamicEntry() && AssetEntry.isDeletedEntryFile(request)) {
      for (const [entryName, entry] of this.compilation.entries) {
        if (entry.dependencies[0]?.request === request) {
          // delete the entry from compilation to prevent creation unused chunks
          this.compilation.entries.delete(entryName);
        }
      }
      return false;
    }

    // skip data-URL
    if (request.startsWith('data:')) return;

    // skip the module loaded via importModule
    if (dependencyType === 'loaderImport') return;

    if (dependencyType === 'url') {
      UrlDependency.resolve(resolveData);
      return;
    }

    if (issuer) {
      const isIssuerStyle = Options.isStyle(issuer);
      const parentModule = resolveData.dependencies[0]?._parentModule;
      const isParentLoaderImport = parentModule?._isLoaderImport;

      // skip the module loaded via importModule
      if (isParentLoaderImport) {
        resolveData._isParentLoaderImport = true;
        return;
      }

      // exclude from compilation the css-loader runtime scripts for styles specified in HTML only,
      // to avoid splitting the loader runtime scripts;
      // allow runtime scripts for styles imported in JavaScript, regards deep imported styles via url()
      if (isIssuerStyle && file.endsWith('.js')) {
        resolveData._isScript = true;

        const rootIssuer = Collection.findRootIssuer(issuer);

        // return true if the root issuer is a JS (not style and not template), otherwise return false
        return rootIssuer != null && !Options.isStyle(rootIssuer) && !Options.isEntry(rootIssuer);
      }
    }

    resolveData._isScript = Collection.hasScript(request);
  }

  /**
   * Called after a module instance is created.
   *
   * @param {Object} module
   * @param {Object} createData
   * @param {Object} resolveData
   */
  afterCreateModule(module, createData, resolveData) {
    const { dependencyType, request } = resolveData;
    const { rawRequest, resource } = createData;

    AssetEntry.connectEntryAndModule(module, resolveData);

    module._isTemplate = AssetEntry.isEntryResource(resource);
    module._isScript = resolveData._isScript === true;
    module._isStyle = Options.isStyle(resource);
    module._isLoaderImport = dependencyType === 'loaderImport';
    module._isDependencyUrl = dependencyType === 'url';

    // skip the module loaded via importModule
    if (module._isLoaderImport || resolveData._isParentLoaderImport === true) return;

    const { type, loaders } = module;
    const { issuer } = resolveData.contextInfo;
    const [file] = resource.split('?', 1);

    if (!issuer || AssetInline.isDataUrl(rawRequest)) return;

    // try to detect imported style as resolved resource file, because a request can be a node module w/o an extension
    // the issuer can be a style if a scss contains like `@import 'main.css'`
    if (issuer && !Options.isStyle(issuer) && !Options.isEntry(issuer) && Options.isStyle(file)) {
      const rootIssuer = Collection.findRootIssuer(issuer);

      module._isImportedStyle = true;
      Collection.importStyleRootIssuers.add(rootIssuer || issuer);

      // check entryId to avoid adding duplicate loaders after changes in serve mode
      // add the CSS loader for only styles imported in JavaScript
      if (!request.includes(cssLoader)) {
        module.loaders.unshift(cssLoader);

        // set the correct module type to enable the usage of built-in CSS support together with the bundler plugin
        // if (this.compilation.compiler.options?.experiments?.css && type === 'css') {
        //   module.type = 'javascript/auto';
        // }
      }

      return;
    }

    if (type === 'asset/inline' || type === 'asset' || (type === 'asset/source' && AssetInline.isSvgFile(resource))) {
      AssetInline.add(resource, issuer, Options.isEntry(issuer));
    }

    if (module._isDependencyUrl && module._isScript) return;

    // add resolved sources in use cases:
    // - if used url() in SCSS for source assets
    // - if used import url() in CSS, like `@import url('./styles.css');`
    // - if used webpack context
    if (module._isDependencyUrl || loaders.length > 0 || type === 'asset/resource') {
      Resolver.addSourceFile(resource, rawRequest, issuer);
    }
  }

  /**
   * Called before a module build has started.
   * Use this method to modify the module.
   *
   * @param {Object} module
   */
  beforeBuildModule(module) {
    // reserved code for future
    // skip the module loaded via importModule
    // if (module._isLoaderImport) return;
    // if (
    //   module.type === 'asset/resource' &&
    //   (module._isScript || (module._isDependencyUrl === true && module._isStyle))
    // ) {
    //   // set correct module type for scripts and styles when used the `html` mode of a loader
    //   module.type = 'javascript/auto';
    //   module.binary = false;
    //   module.parser = new JavascriptParser('auto');
    //   module.generator = new JavascriptGenerator();
    // }
  }

  /**
   * Called after the build module but right before the execution of a loader.
   *
   * @param {Object} loaderContext The Webpack loader context.
   * @param {Object} module The Webpack module.
   */
  beforeLoader(loaderContext, module) {
    // skip the module loaded via importModule
    if (module._isLoaderImport) return;

    const entryId = AssetEntry.getEntryId(module);

    if (entryId) {
      const entry = AssetEntry.getById(entryId);

      if (entry.isTemplate && entry.resource === module.resource) {
        this.beforeProcessTemplate(entryId);
      }

      loaderContext.entryId = entryId;
      loaderContext.entryName = entry.name;
      loaderContext.entryData = AssetEntry.getData(entryId);

      AssetEntry.applyTemplateFilename(entry);
      Collection.addEntry(entry);
    }
  }

  /**
   * Called after a module has been built successfully, after loader processing.
   *
   * @param {Object} module The Webpack module.
   */
  afterBuildModule(module) {
    // decide an asset type by webpack option parser.dataUrlCondition.maxSize
    if (module.type === 'asset') {
      module.type = module.buildInfo.dataUrl === true ? 'asset/inline' : 'asset/resource';
    }
  }

  /**
   * @param {Array<Object>} result
   * @param {Object} chunk
   * @param {Object} chunkGraph
   * @param {Object} outputOptions
   * @param {Object} codeGenerationResults
   */
  renderManifest(result, { chunk, chunkGraph, codeGenerationResults }) {
    if (chunk instanceof HotUpdateChunk) return;

    const entry = AssetEntry.get(chunk.name);

    // process only entries supported by this plugin
    if (!entry || (!entry.isTemplate && !entry.isStyle)) return;

    const { RawSource, ConcatSource } = this.webpack.sources;
    const assetModules = new Set();
    const chunkModules = chunkGraph.getChunkModulesIterable(chunk);

    AssetEntry.setFilename(entry, chunk);
    Collection.setEntryDependencies(entry);

    for (const module of chunkModules) {
      const { _isScript, _isImportedStyle, resource, resourceResolveData } = module;

      if (
        _isScript ||
        _isImportedStyle ||
        !resource ||
        !resourceResolveData?.context ||
        AssetInline.isDataUrl(resource)
      ) {
        // do nothing for scripts because webpack itself compiles and extracts JS files from scripts
        continue;
      }

      const contextIssuer = resourceResolveData.context.issuer;

      // note: the contextIssuer may be wrong, as previous entry, because Webpack distinct same modules by first access
      let issuer = contextIssuer === entry.sourceFile ? entry.resource : contextIssuer;

      if (!issuer || Options.isEntry(issuer)) {
        issuer = entry.resource;
      }

      switch (module.type) {
        case 'javascript/auto':
          const assetModule = this.createAssetModule(entry, chunk, module);

          if (assetModule == null) continue;
          if (assetModule === false) return;

          assetModules.add(assetModule);
          break;
        case 'asset/resource':
          // resource required in the template or in the CSS via url()
          AssetResource.saveData(module);
          break;
        case 'asset/inline':
          AssetInline.saveData(entry, chunk, module, codeGenerationResults);
          break;
        case 'asset/source':
          // support the source type for SVG only
          if (AssetInline.isSvgFile(resource)) {
            AssetInline.saveData(entry, chunk, module, codeGenerationResults);
          }
          break;
        default:
        // do nothing
      }
    }

    // 1. render entries and styles specified in HTML
    for (const module of assetModules) {
      const { fileManifest } = module;
      const content = this.renderModule(module);

      if (content == null) continue;

      fileManifest.filename = module.assetFile;
      //fileManifest.render = () => new RawSource(content);
      fileManifest.render = () => (typeof content === 'string' ? new RawSource(content) : content);
      result.push(fileManifest);
    }

    // 2. render styles imported in JavaScript
    if (Collection.hasImportedStyle(this.currentEntryPoint?.id)) {
      this.renderImportStyles(result, { chunk });
    }
  }

  /**
   * @param {Object} entry The entry point of the chunk.
   * @param {Object} chunk The chunk of an asset.
   * @param {Object} module The module of the chunk.
   * @return {Object|null|boolean} assetModule Returns the asset module object.
   *   If returns undefined, then skip processing of the module.
   *   If returns null, then break the hook processing to show the original error, occurs by an inner error.
   */
  createAssetModule(entry, chunk, module) {
    const { compilation } = this;
    const { buildInfo, resource } = module;
    const [sourceFile] = resource.split('?', 1);
    const source = module.originalSource();

    // break process if occurs an error in module builder
    if (source == null) return false;

    // note: the `id` is
    // - in production mode as a number
    // - in development mode as a relative path
    const moduleId = compilation.chunkGraph.getModuleId(module);
    const assetModule = {
      // resourceInfo
      outputPath: undefined,
      filename: undefined,
      // renderContent arguments
      type: undefined,
      inline: false,
      source,
      sourceFile,
      resource,
      assetFile: undefined,
      fileManifest: {
        identifier: undefined,
        hash: undefined,
      },
    };

    if (sourceFile === entry.sourceFile) {
      //const assetFile = AssetEntry.getFilename(entry);
      const assetFile = entry.filename;
      // note: the entry can be not a template file, e.g., a style or script defined directly in entry
      if (entry.isTemplate) {
        this.currentEntryPoint = entry;
        assetModule.type = Collection.type.template;

        // save the template request with the query, because it can be resolved with different output paths:
        // - 'index':    './index.ext'         => dist/index.html
        // - 'index/de': './index.ext?lang=de' => dist/de/index.html
        Asset.add(resource, assetFile);
      } else if (Options.isStyle(sourceFile)) {
        assetModule.type = Collection.type.style;
      } else {
        // skip unsupported entry type
        return;
      }

      assetModule.outputPath = entry.outputPath;
      assetModule.filename = entry.filenameTemplate;
      assetModule.assetFile = assetFile;
      assetModule.fileManifest.identifier = `${pluginName}.${chunk.id}`;
      assetModule.fileManifest.hash = chunk.contentHash['javascript'];

      return assetModule;
    }

    // extract CSS
    const cssOptions = Options.getStyleOptions(sourceFile);
    if (cssOptions == null) return;

    const inline = Collection.isInlineStyle(resource);
    const { name } = path.parse(sourceFile);
    const hash = buildInfo.assetInfo?.contenthash || buildInfo.hash;
    const { isCached, filename } = this.getStyleAsseFile({
      name,
      chunkId: chunk.id,
      hash,
      resource: sourceFile,
    });
    const assetFile = inline ? this.getInlineStyleAsseFile(filename, this.currentEntryPoint.filename) : filename;
    const data = {
      type: Collection.type.style,
      inline,
      resource,
      assetFile,
    };

    Collection.setData(this.currentEntryPoint, null, data);
    Resolver.addAsset({ resource, filename: assetFile });

    // skip already processed styles except inlined
    if (isCached && !inline) {
      return;
    }

    assetModule.type = Collection.type.style;
    assetModule.inline = inline;
    assetModule.outputPath = cssOptions.outputPath;
    assetModule.filename = cssOptions.filename;
    assetModule.assetFile = assetFile;
    assetModule.fileManifest.identifier = `${pluginName}.${chunk.id}.${moduleId}`;
    assetModule.fileManifest.hash = hash;

    return assetModule;
  }

  /**
   * Render styles imported in JavaScript.
   *
   * @param {Array<Object>} result
   * @param {Object} chunk
   */
  renderImportStyles(result, { chunk }) {
    const { createHash } = this.webpack.util;
    const isAutoPublicPath = Options.isAutoPublicPath();
    const publicPath = Options.getPublicPath();
    const inline = Options.getCss().inline;
    const esModule = Collection.isImportStyleEsModule();
    const urlRegex = new RegExp(`${esModule ? baseUri : ''}${urlPathPrefix}(.+?)(?=\\))`, 'g');
    const entry = this.currentEntryPoint;
    const entryFilename = entry.filename;
    const orderedRootIssuers = Collection.orderedResources.get(entry.id);

    for (const issuer of orderedRootIssuers) {
      if (!Collection.importStyleRootIssuers.has(issuer)) continue;

      const issuerEntry = AssetEntry.getByResource(issuer);
      const sources = [];
      const imports = [];
      let cssHash = '';

      // 1. get styles from all nested files imported in the root JS file and sort them
      const modules = Collection.findImportedModules(entry.id, issuer, chunk);

      // 2. squash styles from all nested files into one file
      modules.forEach((module) => {
        const data = {
          type: Collection.type.style,
          imported: true,
          inline: undefined,
          resource: module.resource,
          assetFile: undefined,
        };

        cssHash += module.buildInfo.hash;
        sources.push(...module._cssSource);
        imports.push(data);
      });

      if (sources.length === 0) continue;

      // 3. generate output filename

      // mixin importStyleIdx into hash to generate new hash after changes
      cssHash += Collection.importStyleIdx++;

      //const hash = this.webpack.util.createHash('md4').update(sources.toString()).digest('hex');
      const hash = createHash('md4').update(cssHash).digest('hex');
      const { isCached, filename } = this.getStyleAsseFile({
        name: issuerEntry.name,
        chunkId: chunk.id,
        hash,
        resource: issuer,
      });
      const assetFile = inline ? this.getInlineStyleAsseFile(filename, entryFilename) : filename;
      const outputFilename = inline ? assetFile : Options.getAssetOutputFile(assetFile, entryFilename);

      Collection.setData(
        entry,
        { resource: issuer },
        {
          type: Collection.type.style,
          inline,
          imports,
          // if exists imports then resource must be null
          resource: null,
          assetFile: outputFilename,
        }
      );

      // skip already processed styles except inlined
      if (isCached && !inline) {
        continue;
      }

      // 4. extract CSS content from squashed sources
      const issuerFilename = inline ? entryFilename : assetFile;

      const resolveAssetFiles = (match, file) => {
        const outputFilename = isAutoPublicPath
          ? Options.getAssetOutputFile(file, issuerFilename)
          : path.posix.join(publicPath, file);

        // note: Webpack itself embeds the asset/inline resources,
        // here will be processed asset/resource only

        for (const module of modules) {
          const assetsInfo = module.buildInfo.assetsInfo?.get(file);

          if (!assetsInfo) continue;

          Collection.setData(
            entry,
            { resource: module.resource },
            {
              type: Collection.type.resource,
              inline: undefined,
              resource: assetsInfo.sourceFilename,
              assetFile: outputFilename,
            }
          );
        }

        return outputFilename;
      };

      const cssContent = CssExtractModule.apply(
        this.compilation,
        {
          data: sources,
          assetFile,
          inline,
        },
        (content) => content.replace(urlRegex, resolveAssetFiles)
      );

      // 5. add extracted CSS file into compilation
      const fileManifest = {
        render: () => cssContent,
        filename: assetFile,
        identifier: `${pluginName}.${chunk.id}`,
        hash,
      };

      result.push(fileManifest);
    }
  }

  /**
   * Get a unique output CSS filename relative to the output path.
   *
   * @param {string} name
   * @param {string} chunkId
   * @param {string} hash
   * @param {string} resource
   * @return {{isCached: boolean, filename: string}}
   */
  getStyleAsseFile({ name, chunkId, hash, resource }) {
    const { compilation } = this;
    const cssOptions = Options.getCss();

    /** @type {PathData} The data to generate an asset path by the filename template. */
    const pathData = {
      contentHash: hash,
      chunk: {
        chunkId,
        name,
        hash,
      },
      filename: resource,
    };

    const assetPath = compilation.getAssetPath(cssOptions.filename, pathData);
    const outputFilename = Options.resolveOutputFilename(assetPath, cssOptions.outputPath);
    const [sourceFile] = resource.split('?', 1);

    // avoid the conflict: multiple chunks emit assets to the same filename
    // this occurs when filename template not contains a hash subsituation,
    // then the output name of css and its issuer is the same
    return Asset.getUniqueFilename(sourceFile, outputFilename);
  }

  /**
   * Get temporary unique output filename for inline css.
   *
   * The same compiled CSS file must have a unique output filename by the entry.
   * After inlining of the compiled asset, this temporary file will be removed from compilation,
   * to avoid creating needles files.
   *
   * @param {string} assetFile
   * @param {string} issuerFile
   * @returns {string}
   */
  getInlineStyleAsseFile(assetFile, issuerFile) {
    return `${issuerFile}_${assetFile}`.replace(/\//g, '-');
  }

  /**
   * Called after the processAssets hook had finished without an error.
   *
   * @note:
   * This stage has the final hashed output js filename.
   * This is the last stage where is able to modify compiled assets.
   *
   * @param {Object} assets
   */
  afterProcessAssets(assets) {
    const compilation = this.compilation;

    if (Object.keys(assets).length < 1) {
      // display original error when occur the resolveException
      return;
    }

    if (!Options.isExtractComments()) {
      AssetTrash.removeComments(compilation);
    }

    /**
     * @param {string} content
     * @param {AssetEntryOptions} entry
     * @return {string|null}
     */
    const callback = (content, entry) => {
      content =
        this.afterProcess(compilation, {
          sourceFile: entry.resource,
          assetFile: entry.filename,
          content,
        }) || content;

      return Options.afterProcess(content, { sourceFile: entry.resource, assetFile: entry.filename }) || content;
    };

    Collection.render(compilation, callback);

    // if (Options.isRealContentHash()) {
    //   // TODO: calc real content hash for js and css
    // }

    // remove all unused assets from compilation
    AssetTrash.clearCompilation(compilation);
  }

  /**
   * Render the module source code generated by a loader.
   *
   * @param {string} type The type of module, one of the values: template, style.
   * @param {boolean} inline Whether the resource should be inlined.
   * @param {Object} source The Webpack source.
   * @param {string} sourceFile The full path of source file w/o a query.
   * @param {string} sourceRequest The full path of source file, including a query.
   * @param {string} assetFile
   * @param {string} outputPath
   * @param {string|function} filename The filename template.
   * @return {string|null} Return rendered HTML or null to not save the rendered content.
   */
  renderModule({ type, inline, source, sourceFile, resource: sourceRequest, assetFile, outputPath, filename }) {
    /** @type  FileInfo */
    const issuer = {
      resource: sourceRequest,
      filename: assetFile,
    };
    Resolver.setContext(this.currentEntryPoint, issuer);

    const vmScript = new VMScript({
      require: Resolver.require,
      // required for `css-loader`
      module: { id: sourceFile },
      // required for ssr
      __filename: sourceFile,
    });

    // the css-loader defaults generate ESM code, which must be transformed into CommonJS to compile the code
    // the template loader generates CommonJS code, no need to transform
    const esModule = type === 'style';
    let result = vmScript.compile(source, sourceFile, esModule);

    switch (type) {
      case 'style':
        result = CssExtractModule.apply(this.compilation, { data: result, assetFile, inline });
        break;
      case 'template':
        if (Options.hasPostprocess()) {
          const resourceInfo = {
            isEntry: true,
            verbose: Options.isVerbose(),
            inline,
            outputPath,
            sourceFile,
            assetFile,
            filename,
          };

          result = Options.postprocess(result, resourceInfo, this.compilation);
        }
        break;
    }

    return result;
  }

  beforeProcessTemplate(entryId) {
    Collection.beforeProcessTemplate(entryId);
  }

  /**
   * Execute after compilation.
   * Reset initial settings and caches by webpack serve/watch, display verbose.
   *
   * @param {Object} stats
   */
  done(stats) {
    const { compilation } = this;
    const hasError = compilation.errors.length > 0 || this.exceptions.size > 0;

    compilation.name = compilationName(hasError);

    if (PluginService.isWatchMode()) {
      const watchDirs = Options.getRootSourcePaths();

      // initialize snapshot only once, after compilation
      if (!this.isSnapshotInitialized) {
        Snapshot.init({
          fs: this.fs,
          dir: watchDirs,
          includes: [Options.options.test, Options.js.test],
        });

        // create initial snapshot of watching files, before any changes
        Snapshot.create();
      }

      // allow watching for changes (add/remove/rename) of linked/missing scripts for static entry too.
      if (Options.isDynamicEntry()) {
        watchDirs.forEach((dir) => compilation.contextDependencies.add(dir));
      }

      this.isSnapshotInitialized = true;
    }

    if (this.exceptions.size > 0) {
      const messages = Array.from(this.exceptions).join('\n\n');
      this.exceptions.clear();
      throw new Error(messages);
    }

    if (Options.isVerbose()) verbose();

    Asset.reset();
    AssetEntry.reset();
    AssetTrash.reset();
    Collection.reset();
    PluginService.reset();
    Resolver.reset();
  }

  /**
   * Called when the compiler is closing or a watching compilation has stopped.
   */
  shutdown() {
    PluginService.shutdown();
  }
}

module.exports = AssetCompiler;
