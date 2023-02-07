const vm = require('vm');
const path = require('path');

const NormalModule = require('webpack/lib/NormalModule');
const JavascriptParser = require('webpack/lib/javascript/JavascriptParser');
const JavascriptGenerator = require('webpack/lib/javascript/JavascriptGenerator');

const { pluginName } = require('./config');
const { isWin, pathToPosix, isFunction, toCommonJS } = require('./Utils');

const { plugin, scriptStore } = require('./Modules');
const extractCss = require('./Modules/extractCss');

const Resolver = require('./Resolver');
const UrlDependency = require('./UrlDependency');

const Asset = require('./Asset');
const AssetEntry = require('./AssetEntry');
const AssetResource = require('./AssetResource');
const AssetInline = require('./AssetInline');
const AssetScript = require('./AssetScript');
const AssetSource = require('./AssetSource');
const AssetTrash = require('./AssetTrash');

const {
  verboseEntry,
  verboseExtractModule,
  verboseExtractResource,
  verboseExtractInlineResource,
} = require('./Messages/Info');

const {
  optionModulesException,
  executeTemplateFunctionException,
  postprocessException,
} = require('./Messages/Exception');

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
 * @property {RegExp} test The search for a match of entry files.
 * @property {boolean} [enabled = true] Enable/disable the plugin.
 * @property {boolean} [verbose = false] Show the information at processing entry files.
 * @property {string} [sourcePath = options.context] The absolute path to sources.
 * @property {string} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} filename The file name of output file.
 * @property {function(string, ResourceInfo, Compilation): string|null =} postprocess The post process for extracted content from entry.
 * @property {function(sourceMaps: string, assetFile: string, compilation: Compilation): string|null =} extract
 */

/**
 * @typedef {Object} ExtractJsOptions
 * @property {boolean} [verbose = false] Show the information at processing entry files.
 * @property {string|function(PathData, AssetInfo): string} [filename = '[name].js'] The file name of output file.
 */

/**
 * @typedef {ModuleOptions} ModuleProps
 * @property {boolean} [`inline` = false] Whether inline CSS should contain inline source map.
 */

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
 * @property {boolean} [verbose = false] Show an information by handles of the entry in a postprocess.
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

const verboseList = new Set();

/** @type RawSource This objects will be assigned by plugin initialisation. */
let RawSource, HotUpdateChunk;

const issuerCache = {
  request: new Map(),

  add(request) {
    const [file] = request.split('?', 1);

    if (!this.request.has(file)) {
      this.request.set(file, new Set());
    }

    this.request.get(file).add(request);
  },

  get(file) {
    return this.request.get(file);
  },

  clear() {
    this.request.clear();
  },
};

class AssetCompiler {
  /** @type {PluginOptions} */
  options = {};

  entryLibrary = {
    name: 'return',
    type: 'jsonp', // compiles JS from source into HTML string via Function()
  };

  // the id to bind loader with data passed into template via entry.data
  entryDataIndex = 1;
  entryDataCache = new Map();

  // webpack's options and modules
  webpackContext = '';
  webpackOutputPath = '';

  // current entry point during dependency compilation
  /** @type AssetEntryOptions */
  currentEntryPoint;

  /**
   * @param {PluginOptions|{}} options
   */
  constructor(options = {}) {
    this.options = options;
    this.enabled = this.options.enabled !== false;
    this.verbose = this.options.verbose === true;

    if (options.modules && !Array.isArray(options.modules)) {
      optionModulesException(options.modules);
    }

    let extractCssOptions = extractCss(options.css);
    const moduleExtractCssOptions = this.options.modules.find(
      (item) => item.test.source === extractCssOptions.test.source
    );

    if (moduleExtractCssOptions) {
      extractCssOptions = moduleExtractCssOptions;
    } else {
      this.options.modules.unshift(extractCssOptions);
    }

    this.options.extractCss = extractCssOptions;
    this.options.extractJs = options.js || {};

    // let know the loader that the plugin is being used
    plugin.init(this.options);

    // bind the instance context for using these methods as references in Webpack hooks
    this.afterProcessEntry = this.afterProcessEntry.bind(this);
    this.beforeResolve = this.beforeResolve.bind(this);
    this.afterCreateModule = this.afterCreateModule.bind(this);
    this.beforeBuildModule = this.beforeBuildModule.bind(this);
    this.renderManifest = this.renderManifest.bind(this);
    this.afterProcessAssets = this.afterProcessAssets.bind(this);
    this.filterAlternativeRequests = this.filterAlternativeRequests.bind(this);
    this.done = this.done.bind(this);
  }

  /**
   * Entries defined in plugin options are merged with Webpack entry option.
   *
   * @param {{}} options The Webpack options where entry contains additional 'data' property.
   */
  initializeWebpackEntry(options) {
    let { entry } = options;
    const pluginEntry = this.options.entry;

    // check whether the entry in config is empty, defaults Webpack set structure: `{ main: {} }`,
    if (Object.keys(entry).length === 1 && Object.keys(Object.entries(entry)[0][1]).length === 0) {
      // set empty entry to avoid Webpack error
      entry = {};
    }

    if (pluginEntry) {
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

      options.entry = { ...entry, ...pluginEntry };

      // the 'layer' entry property is only allowed when 'experiments.layers' is enabled
      options.experiments.layers = true;
    }
  }

  /**
   * Get plugin module depend on type of source file.
   *
   * @param {string} sourceFile The source file of asset.
   * @returns {ModuleOptions|undefined}
   */
  getModule(sourceFile) {
    return this.options.modules.find((module) => module.enabled !== false && module.test.test(sourceFile));
  }

  /**
   * Whether the source file is an entry file.
   *
   * @param {string} sourceFile
   * @return {boolean}
   */
  isEntry(sourceFile) {
    const [file] = sourceFile.split('?', 1);
    return this.options.test.test(file);
  }

  /**
   * Apply plugin.
   * @param {{}} compiler
   */
  apply(compiler) {
    if (!this.enabled) return;

    const { webpack, options } = compiler;
    const webpackOutput = options.output;
    const { extractJs } = this.options;

    RawSource = webpack.sources.RawSource;
    HotUpdateChunk = webpack.HotUpdateChunk;

    // save using webpack options
    this.webpackContext = options.context;
    this.webpackOutputPath = webpackOutput.path || path.join(__dirname, 'dist');

    // define js output filename
    if (!webpackOutput.filename) {
      webpackOutput.filename = '[name].js';
    }
    if (extractJs.filename) {
      webpackOutput.filename = extractJs.filename;
    } else {
      extractJs.filename = webpackOutput.filename;
    }

    // resolve js filename by outputPath
    if (extractJs.outputPath) {
      const filename = extractJs.filename;

      extractJs.filename = isFunction(filename)
        ? (pathData, assetInfo) => this.resolveOutputFilename(filename(pathData, assetInfo), extractJs.outputPath)
        : this.resolveOutputFilename(extractJs.filename, extractJs.outputPath);

      webpackOutput.filename = extractJs.filename;
    }

    Asset.init({
      outputPath: this.webpackOutputPath,
      publicPath: webpackOutput.publicPath,
    });
    AssetResource.init(compiler);
    AssetEntry.setWebpackOutputPath(this.webpackOutputPath);

    // clear caches by tests for webpack serve/watch
    AssetScript.clear();
    Resolver.clear();
    AssetEntry.clear();

    // enable library type
    const libraryType = this.entryLibrary.type;
    if (webpackOutput.enabledLibraryTypes.indexOf(libraryType) < 0) {
      webpackOutput.enabledLibraryTypes.push(libraryType);
    }

    if (!this.options.sourcePath) this.options.sourcePath = this.webpackContext;
    if (!this.options.outputPath) this.options.outputPath = this.webpackOutputPath;

    compiler.hooks.initialize.tap(pluginName, () => {
      // reserved for future feature
    });

    // options.entry
    this.initializeWebpackEntry(options);

    // entry options
    compiler.hooks.entryOption.tap(pluginName, this.afterProcessEntry);

    // executes by watch/serve only, before the compilation
    compiler.hooks.watchRun.tap(pluginName, (compiler) => {
      const { publicPath } = compiler.options.output;
      if (publicPath == null || publicPath === 'auto') {
        // By using watch/serve browsers not support an automatic publicPath in HMR script injected into inlined JS,
        // the output.publicPath must be an empty string.
        compiler.options.output.publicPath = '';
      }
    });

    // this compilation
    compiler.hooks.thisCompilation.tap(pluginName, (compilation, { normalModuleFactory, contextModuleFactory }) => {
      this.compilation = compilation;

      Resolver.init({
        fs: normalModuleFactory.fs.fileSystem,
        rootContext: this.webpackContext,
      });

      UrlDependency.init({
        fs: normalModuleFactory.fs.fileSystem,
        moduleGraph: compilation.moduleGraph,
      });

      AssetEntry.setCompilation(compilation);

      // resolve modules
      normalModuleFactory.hooks.beforeResolve.tap(pluginName, this.beforeResolve);
      contextModuleFactory.hooks.alternativeRequests.tap(pluginName, this.filterAlternativeRequests);

      // build modules
      normalModuleFactory.hooks.module.tap(pluginName, this.afterCreateModule);
      compilation.hooks.buildModule.tap(pluginName, this.beforeBuildModule);
      compilation.hooks.succeedModule.tap(pluginName, this.afterBuildModule);

      // called after the module hook but right before the execution of a loader
      NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (loaderContext, module) => {
        if (typeof module.layer === 'string' && module.layer.startsWith('__entryDataId')) {
          const [, entryDataId] = module.layer.split('=', 2);
          loaderContext.entryData = this.entryDataCache.get(entryDataId);
          loaderContext.data = this.entryDataCache.get(entryDataId);
        }
      });

      // render source code of modules
      compilation.hooks.renderManifest.tap(pluginName, this.renderManifest);

      // after render sources
      compilation.hooks.processAssets.tap(
        { name: pluginName, stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        (assets) => {
          AssetTrash.clearCompilation(compilation);
        }
      );

      // postprocess for assets content
      compilation.hooks.afterProcessAssets.tap(pluginName, this.afterProcessAssets);
    });

    compiler.hooks.done.tap(pluginName, this.done);
  }

  /**
   * Called after the entry configuration from webpack options has been processed.
   *
   * @param {string} context The base directory, an absolute path, for resolving entry points and loaders from the configuration.
   * @param {Object<name:string, entry: Object>} entries The webpack entries.
   */
  afterProcessEntry(context, entries) {
    const extensionRegexp = this.options.test;

    for (let name in entries) {
      const entry = entries[name];
      let { filename: filenameTemplate, sourcePath, outputPath, postprocess, extract, verbose } = this.options;
      const importFile = entry.import[0];
      let request = importFile;
      let [sourceFile] = importFile.split('?', 1);
      const module = this.getModule(sourceFile);

      if (!extensionRegexp.test(sourceFile) && !module) continue;
      if (!entry.library) entry.library = this.entryLibrary;

      if (module) {
        if (module.hasOwnProperty('verbose')) verbose = module.verbose;
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

        entry.layer = `__entryDataId=${this.entryDataIndex}`;
        this.entryDataCache.set(`${this.entryDataIndex}`, entry.data);
        this.entryDataIndex++;
      }

      AssetEntry.add(entry, assetEntryOptions);
    }
  }

  /**
   * Called when a new dependency request is encountered.
   *
   * @param {Object} resolveData
   * @return {boolean|undefined} Return undefined to processing, false to ignore dependency.
   */
  beforeResolve(resolveData) {
    const { context, request, contextInfo } = resolveData;
    const { issuer } = contextInfo;
    const [resourceFile] = request.split('?', 2);

    // save requests to issuer cache
    if (!issuer) issuerCache.add(request);

    // ignore data-URL
    if (request.startsWith('data:')) return;

    if (issuer && issuer.length > 0) {
      const extractCss = this.options.extractCss;
      if (extractCss.enabled && extractCss.test.test(issuer) && resourceFile.endsWith('.js')) {
        // ignore runtime scripts of a loader, because a style can't have a javascript dependency
        return false;
      }

      const scriptFile = AssetScript.resolveFile(request);
      if (scriptFile) {
        const issuers = issuerCache.get(issuer);
        const name = AssetScript.getUniqueName(scriptFile);
        const isAdded = AssetEntry.addToCompilation({
          name,
          importFile: scriptFile,
          filenameTemplate: this.options.extractJs.filename,
          context,
          issuer,
        });

        scriptStore.setName(scriptFile, issuers, name);

        return isAdded ? undefined : false;
      }
    }

    if (resolveData.dependencyType === 'url') {
      UrlDependency.resolve(resolveData);
    }
  }

  /**
   * Filter alternative requests.
   *
   * Entry files should not have alternative requests.
   * If the template file contains require and is compiled with `compile` method,
   * then ContextModuleFactory generate additional needless request as relative path without query.
   * Such 'alternative request' must be removed from compilation.
   *
   * @param {Array<{}>} requests
   * @param {{}} options
   * @return {Array} Returns only alternative requests not related to entry files.
   */
  filterAlternativeRequests(requests, options) {
    return requests.filter((item) => !this.isEntry(item.request));
  }

  /**
   * Called after a NormalModule instance is created.
   *
   * @param {Object} module
   * @param {Object} createData
   * @param {Object} resolveData
   */
  afterCreateModule(module, createData, resolveData) {
    const { type, loaders } = module;
    const { rawRequest, resource } = createData;
    const { issuer } = resolveData.contextInfo;

    if (!issuer || AssetInline.isDataUrl(rawRequest)) return;

    if (type === 'asset/inline' || type === 'asset') {
      AssetInline.add(resource, issuer, this.isEntry(issuer));
    }

    if (resolveData.dependencyType === 'url') {
      if (AssetScript.isScript(module)) return;

      module.__isDependencyTypeUrl = true;
    }

    // add resolved sources in use cases:
    // - if used url() in SCSS for source assets
    // - if used import url() in CSS, like `@import url('./styles.css');`
    // - if used webpack context
    if (module.__isDependencyTypeUrl === true || loaders.length > 0 || type === 'asset/resource') {
      Resolver.addSourceFile(resource, rawRequest, issuer);
    }
  }

  /**
   * Called before a module build has started.
   *
   * @param {Object} module
   */
  beforeBuildModule(module) {
    if (
      module.type === 'asset/resource' &&
      (AssetScript.isScript(module) || (module.__isDependencyTypeUrl === true && Asset.isStyle(module)))
    ) {
      // set correct module type for scripts and styles when used the `html` method of a loader
      module.type = 'javascript/auto';
      module.binary = false;
      module.parser = new JavascriptParser('auto');
      module.generator = new JavascriptGenerator();
    }
  }

  /**
   * Called after a module has been built successfully.
   *
   * @param {Object} module The Webpack module.
   */
  afterBuildModule(module) {
    // decide asset type by webpack option parser.dataUrlCondition.maxSize
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
  renderManifest(result, { chunk, chunkGraph, outputOptions, codeGenerationResults }) {
    const { compilation, verbose } = this;

    if (chunk instanceof HotUpdateChunk) return;

    const entry = AssetEntry.get(chunk.name);

    // process only entries supported by this plugin
    if (!entry) return;

    const assetModules = new Set();
    const contentHashType = 'javascript';
    const chunkModules = chunkGraph.getChunkModulesIterable(chunk);

    entry.filename = compilation.getPath(chunk.filenameTemplate, { contentHashType, chunk });
    AssetScript.setIssuerFilename(entry.request, entry.filename);

    this.currentEntryPoint = null;

    for (const module of chunkModules) {
      const { buildInfo, resource: sourceRequest, resourceResolveData } = module;

      if (!sourceRequest || AssetInline.isDataUrl(sourceRequest)) continue;

      const inline = Asset.isInline(resourceResolveData.query) || module.type === 'asset/source';
      const { issuer } = resourceResolveData.context;
      const [sourceFile] = sourceRequest.split('?', 1);
      let issuerFile = !issuer || this.isEntry(issuer) ? entry.importFile : issuer;

      if (module.type === 'javascript/auto') {
        // do nothing for scripts because webpack itself compiles and extracts JS files from scripts
        if (AssetScript.isScript(module)) {
          if (this.options.extractJs.verbose && issuerFile !== sourceFile) {
            verboseList.add({
              type: 'script',
              header: 'Extract JS',
              issuerFile,
              sourceFile,
              outputPath: this.options.extractJs.outputPath || this.webpackOutputPath,
            });
          }
          continue;
        }

        // entry point
        if (sourceFile === entry.importFile) {
          const source = module.originalSource();
          // break process by module builder error
          if (source == null) return;

          const { filename: assetFile } = entry;

          // Note: save full path with param queries because
          // the template request in entry can be resolved with different output paths:
          // - 'index':    './index.ext'         => dist/index.html
          // - 'index/de': './index.ext?lang=de' => dist/de/index.html
          Asset.add(sourceRequest, assetFile);

          if (verbose) {
            verboseList.add({
              type: 'entry',
              name: chunk.name,
            });
          }

          assetModules.add({
            inline,
            // resourceInfo
            isEntry: true,
            verbose: entry.verbose,
            outputPath: entry.outputPath,
            filenameTemplate: entry.filenameTemplate,
            // renderContent arguments
            source,
            sourceFile,
            sourceRequest,
            assetFile,
            pluginModule: entry,
            fileManifest: {
              filename: assetFile,
              identifier: `${pluginName}.${chunk.id}`,
              hash: chunk.contentHash[contentHashType],
            },
          });

          this.currentEntryPoint = entry;

          continue;
        }

        // asset supported via the plugin module
        const pluginModule = this.getModule(sourceFile);
        if (pluginModule == null) continue;

        const source = module.originalSource();
        // break process by module builder error
        if (source == null) return;

        // note: the `id` is
        // - in production mode as a number
        // - in development mode as a relative path
        const id = chunkGraph.getModuleId(module);
        const { name } = path.parse(sourceFile);
        const hash = buildInfo.assetInfo ? buildInfo.assetInfo.contenthash : buildInfo.hash;
        const filenameTemplate = pluginModule.filename ? pluginModule.filename : entry.filenameTemplate;

        /** @type {PathData} The data to generate an asset path by filenameTemplate. */
        const pathData = {
          contentHash: hash,
          chunk: {
            chunkId: chunk.id,
            id,
            name,
            hash,
          },
          filename: sourceFile,
        };

        const assetPath = compilation.getAssetPath(filenameTemplate, pathData);
        const { isCached, filename } = Asset.getUniqueFilename(sourceFile, assetPath);
        let assetFile = filename;

        // apply outputPath option for plugin module, e.g. for 'css'
        if (pluginModule.test.test(sourceFile)) {
          assetFile = this.resolveOutputFilename(assetFile, pluginModule.outputPath);
        }

        Resolver.addAsset(sourceRequest, assetFile);

        if (inline) {
          AssetSource.add(sourceRequest);
        }

        // skip already processed file assets, but all inline assets must be processed
        if (isCached && !inline) {
          continue;
        }

        const moduleVerbose = pluginModule.verbose || entry.verbose;
        const moduleOutputPath = pluginModule.outputPath || entry.outputPath;

        if (moduleVerbose) {
          verboseList.add({
            type: 'module',
            header: pluginModule.verboseHeader,
            sourceFile,
            outputPath: moduleOutputPath,
          });
        }

        assetModules.add({
          inline,
          // resourceInfo
          isEntry: false,
          verbose: moduleVerbose,
          outputPath: moduleOutputPath,
          filenameTemplate,
          // renderContent arguments
          source,
          sourceFile,
          sourceRequest,
          assetFile,
          pluginModule,
          fileManifest: {
            filename: assetFile,
            identifier: `${pluginName}.${chunk.id}.${id}`,
            hash,
          },
        });
      } else if (module.type === 'asset/resource') {
        // resource required in the template or in the CSS via url()
        AssetResource.render(module, issuerFile, this.currentEntryPoint);

        if (verbose) {
          verboseList.add({
            type: module.type,
            sourceFile: sourceRequest,
          });
        }
      } else if (module.type === 'asset/inline') {
        AssetInline.render({ module, chunk, codeGenerationResults, issuerAssetFile: entry.filename });

        if (verbose) {
          verboseList.add({
            type: module.type,
            sourceFile: sourceRequest,
          });
        }
      }
    }

    // render modules after collection of dependencies in all chunks
    for (let module of assetModules) {
      const { fileManifest } = module;
      const content = this.renderModule(module);

      if (content != null) {
        fileManifest.render = () => new RawSource(content);
        result.push(fileManifest);
      }
    }
  }

  /**
   * Called after the processAssets hook had finished without error.
   * @note: Only at this stage the js file has the final hashed name.
   */
  afterProcessAssets() {
    const compilation = this.compilation;
    const RawSource = compilation.compiler.webpack.sources.RawSource;

    if (this.options.extractComments !== true) {
      AssetTrash.removeComments(compilation);
    }

    AssetScript.replaceSourceFilesInCompilation(compilation);
    AssetInline.insertInlineSvg(compilation);
    AssetSource.inlineSource(compilation);

    for (const assetFile in compilation.assets) {
      const sourceFile = Asset.findSourceFile(assetFile) || AssetScript.findSourceFile(assetFile);
      const source = compilation.assets[assetFile].source();
      const result = this.afterProcess(compilation, { sourceFile, assetFile, source });

      if (result != null) {
        compilation.updateAsset(assetFile, new RawSource(result));
      }
    }
  }

  /**
   * Abstract method should be overridden in child class.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @param {string} sourceFile The source filename of asset.
   * @param {string} assetFile The output filename of asset.
   * @param {string} source The source of compiled asset.
   * @return {string|undefined}
   * @abstract
   */
  afterProcess(compilation, { sourceFile, assetFile, source }) {}

  /**
   * Render the module source code generated by a loader.
   *
   * @param {boolean} inline Whether the resource should be inlined.
   * @param {Object} source The Webpack source.
   * @param {string} sourceFile The full path of source file w/o URL query.
   * @param {string} sourceRequest The full path of source file with URL query.
   * @param {string} assetFile
   * @param {boolean} isEntry
   * @param {boolean} verbose
   * @param {string} outputPath
   * @param {string|function} filenameTemplate
   * @param {ModuleProps} pluginModule
   * @return {string|null} Return rendered HTML or null to not save the rendered content.
   */
  renderModule({
    inline,
    source,
    sourceFile,
    sourceRequest,
    assetFile,
    isEntry,
    verbose,
    outputPath,
    filenameTemplate,
    pluginModule,
  }) {
    let code = source.source();

    if (!code) {
      // TODO: reproduce this case and write test
      // the source is empty when webpack config contains an error
      return null;
    }

    if (Buffer.isBuffer(code)) {
      code = code.toString();
    }

    if (code.indexOf('export default') > -1) {
      code = toCommonJS(code);
    }

    Resolver.setContext(sourceRequest, this.currentEntryPoint);

    const contextOptions = {
      require: Resolver.require,
      // the `module.id` is required for `css-loader`, in module extractCss expected as source path
      module: { id: sourceFile },
    };
    const contextObject = vm.createContext(contextOptions);
    const script = new vm.Script(code, { filename: sourceFile });
    const compiledCode = script.runInContext(contextObject) || '';
    let content;

    try {
      content = isFunction(compiledCode) ? compiledCode() : compiledCode;
    } catch (error) {
      executeTemplateFunctionException(error, sourceFile, code);
    }

    if (pluginModule) {
      if (pluginModule.extract) {
        pluginModule.inline = inline;
        content = pluginModule.extract(content, assetFile, this.compilation);
      }
      if (pluginModule.postprocess) {
        const resourceInfo = {
          isEntry,
          verbose,
          outputPath,
          sourceFile,
          assetFile,
          filename: filenameTemplate,
        };
        try {
          content = pluginModule.postprocess(content, resourceInfo, this.compilation);
        } catch (error) {
          postprocessException(error, resourceInfo);
        }
      }
    }

    if (inline) {
      AssetSource.setSource(sourceRequest, this.currentEntryPoint.filename, content);
      return null;
    }

    return content;
  }

  /**
   * Execute after compilation.
   * Reset initial settings and caches by webpack serve/watch, display verbose.
   *
   * @param {Object} stats
   */
  done(stats) {
    // display verbose after rendering of all modules
    if (verboseList.size > 0) {
      for (let item of verboseList) {
        const { type, issuerFile, sourceFile, outputPath } = item;

        switch (type) {
          case 'entry': {
            const entry = AssetEntry.get(item.name);
            verboseEntry(entry);
            break;
          }
          case 'module': {
            const { originalAssetFile, issuers } = Resolver.data.get(sourceFile);
            verboseExtractModule({
              sourceFile,
              assetFile: originalAssetFile,
              issuers,
              outputPath,
              header: item.header,
            });
            break;
          }
          case 'script': {
            const posixSourceFile = isWin ? pathToPosix(sourceFile) : sourceFile;
            const assetFile = scriptStore.files.find(({ file }) => file === posixSourceFile)?.chunkFiles;
            verboseExtractModule({
              sourceFile,
              assetFile,
              issuers: [issuerFile],
              outputPath,
              header: item.header,
            });
            break;
          }
          case 'asset/resource': {
            const { originalAssetFile, issuers } = Resolver.data.get(sourceFile);
            verboseExtractResource({
              sourceFile,
              assetFile: originalAssetFile,
              issuers,
              outputPath: this.webpackOutputPath,
            });
            break;
          }
          case 'asset/inline':
            verboseExtractInlineResource({
              sourceFile,
              data: AssetInline.data.get(sourceFile),
            });
            break;
          // no default
        }
      }
    }

    verboseList.clear();
    issuerCache.clear();

    Asset.reset();
    AssetEntry.reset();
    AssetScript.reset();
    AssetTrash.reset();
    Resolver.reset();
  }

  /**
   * @param {string} filename The output filename.
   * @param {string | null} outputPath The output path.
   * @return {string}
   */
  resolveOutputFilename(filename, outputPath) {
    if (!outputPath) return filename;

    let relativeOutputPath = path.isAbsolute(outputPath)
      ? path.relative(this.webpackOutputPath, outputPath)
      : outputPath;

    if (relativeOutputPath) {
      if (isWin) relativeOutputPath = pathToPosix(relativeOutputPath);
      filename = path.posix.join(relativeOutputPath, filename);
    }

    return filename;
  }
}

module.exports = AssetCompiler;
