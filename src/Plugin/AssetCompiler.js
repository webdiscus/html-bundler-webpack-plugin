const vm = require('vm');
const path = require('path');

const NormalModule = require('webpack/lib/NormalModule');
// const JavascriptParser = require('webpack/lib/javascript/JavascriptParser');
// const JavascriptGenerator = require('webpack/lib/javascript/JavascriptGenerator');

const { pluginName } = require('../config');
const { isFunction } = require('../Common/Helpers');
const { toCommonJS } = require('./Utils');

const Options = require('./Options');
const PluginService = require('./PluginService');
const Collection = require('./Collection');
const Resolver = require('./Resolver');
const UrlDependency = require('./UrlDependency');

const Asset = require('./Asset');
const AssetEntry = require('./AssetEntry');
const AssetResource = require('./AssetResource');
const AssetInline = require('./AssetInline');
const AssetScript = require('./AssetScript');
const AssetTrash = require('./AssetTrash');

const { verbose } = require('./Messages/Info');
const { executeTemplateFunctionException, postprocessException } = require('./Messages/Exception');

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
 * @property {boolean|string} [verbose = false] Show the information at processing entry files.
 * @property {string} [sourcePath = options.context] The absolute path to sources.
 * @property {string} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} filename The file name of output file.
 * @property {function(string, ResourceInfo, Compilation): string|null =} postprocess The post process for extracted content from entry.
 * @property {function(compilation: Compilation, {source: string, assetFile: string, inline: boolean} ): string|null =} extract
 */

/**
 * @typedef {ModuleOptions} ModuleProps
 * @property {boolean} [`inline` = false] Whether inline CSS should contain inline source map.
 */

/**
 * @typedef {Object} ExtractJsOptions
 * @property {string} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} [filename = '[name].js'] The file name of output file.
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
 * @property {string} resource The resource file, including query.
 * @property {string|undefined} filename The output filename.
 */

/** @type RawSource This objects will be assigned by plugin initialisation. */
let RawSource, HotUpdateChunk;

class AssetCompiler {
  entryLibrary = {
    name: 'return',
    type: 'jsonp', // compiles JS from source into HTML string via Function()
  };

  /** @type AssetEntryOptions The current entry point during dependency compilation. */
  currentEntryPoint;

  /**
   * @param {PluginOptions|{}} options
   */
  constructor(options = {}) {
    Options.init(options, { AssetEntry });

    // let know the loader that the plugin is being used
    PluginService.init(Options);

    // bind the instance context for using these methods as references in Webpack hooks
    this.afterProcessEntry = this.afterProcessEntry.bind(this);
    this.beforeResolve = this.beforeResolve.bind(this);
    this.afterCreateModule = this.afterCreateModule.bind(this);
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
   * Called after asset sources have been rendered in the next stage `processAssets`.
   * Abstract method should be overridden in child class.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @param {Function} callback This method is async. The callback must be called to let the webpack compiler continue.
   * @abstract
   * @async
   */
  afterRenderModules(compilation, callback) {}

  /**
   * Called after the processAssets hook had finished without error.
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

    RawSource = webpack.sources.RawSource;
    HotUpdateChunk = webpack.HotUpdateChunk;

    Options.initWebpack(compiler.options);
    Options.enableLibraryType(this.entryLibrary.type);
    this.initialize(compiler);

    AssetResource.init(compiler);

    // clear caches by tests for webpack serve/watch
    AssetScript.clear();
    Resolver.clear();
    AssetEntry.clear();

    // executes by watch/serve only, before the compilation
    compiler.hooks.watchRun.tap(pluginName, (compiler) => {
      Options.initWatchMode();
      PluginService.setWatchMode(true);
      PluginService.watchRun();
    });

    // entry options
    compiler.hooks.entryOption.tap(pluginName, this.afterProcessEntry);

    // this compilation
    compiler.hooks.thisCompilation.tap(pluginName, (compilation, { normalModuleFactory, contextModuleFactory }) => {
      this.compilation = compilation;

      Resolver.init({
        fs: normalModuleFactory.fs.fileSystem,
        rootContext: Options.rootContext,
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
          loaderContext.entryData = AssetEntry.getData(entryDataId);
          loaderContext.data = AssetEntry.getData(entryDataId);
        }
      });

      // render source code of modules
      compilation.hooks.renderManifest.tap(pluginName, this.renderManifest);

      // after render module's sources
      // note: only here is possible to modify an asset content via async function
      compilation.hooks.processAssets.tapPromise(
        { name: pluginName, stage: compilation.PROCESS_ASSETS_STAGE_REPORT },
        (assets) => {
          const result = this.afterRenderModules(compilation);

          return Promise.resolve(result);
        }
      );

      // postprocess for assets content
      compilation.hooks.afterProcessAssets.tap(pluginName, this.afterProcessAssets);
    });

    compiler.hooks.done.tap(pluginName, this.done);
    compiler.hooks.shutdown.tap(pluginName, this.shutdown);
    compiler.hooks.watchClose.tap(pluginName, this.shutdown);
  }

  /**
   * Called after the entry configuration from webpack options has been processed.
   *
   * @param {string} context The base directory, an absolute path, for resolving entry points and loaders from the configuration.
   * @param {Object<name:string, entry: Object>} entries The webpack entries.
   */
  afterProcessEntry(context, entries) {
    AssetEntry.addEntries(entries, { entryLibrary: this.entryLibrary });
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

    // ignore data-URL
    if (request.startsWith('data:')) return;

    if (issuer) {
      // ignore and exclude from compilation the runtime script of a css loader
      if (Options.isStyle(issuer) && resourceFile.endsWith('.js')) return false;

      if (Collection.isScript(request)) {
        return AssetScript.add({ resource: request, issuer, context });
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
   * If the template file contains require and is compiled with `compile` mode,
   * then ContextModuleFactory generate additional needless request as relative path without query.
   * Such 'alternative request' must be removed from compilation.
   *
   * @param {Array<{}>} requests
   * @param {{}} options
   * @return {Array} Returns only alternative requests not related to entry files.
   */
  filterAlternativeRequests(requests, options) {
    return requests.filter((item) => !Options.isEntry(item.request));
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

    if (type === 'asset/inline' || type === 'asset' || (type === 'asset/source' && AssetInline.isSvgFile(resource))) {
      AssetInline.add(resource, issuer, Options.isEntry(issuer));
    }

    if (resolveData.dependencyType === 'url') {
      if (Collection.isModuleScript(module)) return;

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
    // reserved code for future
    // if (
    //   module.type === 'asset/resource' &&
    //   (Collection.isModuleScript(module) || (module.__isDependencyTypeUrl === true && Collection.isModuleStyle(module)))
    // ) {
    //   // set correct module type for scripts and styles when used the `html` mode of a loader
    //   module.type = 'javascript/auto';
    //   module.binary = false;
    //   module.parser = new JavascriptParser('auto');
    //   module.generator = new JavascriptGenerator();
    // }
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
    const { compilation } = this;

    if (chunk instanceof HotUpdateChunk) return;

    const entry = AssetEntry.get(chunk.name);

    // process only entries supported by this plugin
    if (!entry) return;

    const assetModules = new Set();
    const contentHashType = 'javascript';
    const chunkModules = chunkGraph.getChunkModulesIterable(chunk);
    this.currentEntryPoint = null;

    AssetEntry.setFilename(entry, chunk);
    Collection.initEntry(entry);

    for (const module of chunkModules) {
      const { buildInfo, resource: sourceRequest, resourceResolveData } = module;

      if (!sourceRequest || !resourceResolveData?.context || AssetInline.isDataUrl(sourceRequest)) continue;

      const [sourceFile] = sourceRequest.split('?', 1);
      const contextIssuer = resourceResolveData.context.issuer;

      // note: the contextIssuer may be wrong, as previous entry, because Webpack distinct same modules by first access
      let issuer = contextIssuer === entry.importFile ? entry.request : contextIssuer;
      let issuerFile = contextIssuer;

      if (!issuer || Options.isEntry(issuer)) {
        issuer = entry.request;
        issuerFile = entry.importFile;
      }

      const issuerInfo = {
        resource: issuer,
        filename: '',
      };

      if (module.type === 'javascript/auto') {
        // extract JS: do nothing for scripts because webpack itself compiles and extracts JS files from scripts
        if (Collection.isModuleScript(module)) {
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

          assetModules.add({
            type: 'entry',
            inline: false,
            // resourceInfo
            isEntry: true,
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

          // note: the entry may be not a template file, e.g. a style or script defined directly in entry
          if (entry.isTemplate) {
            this.currentEntryPoint = entry;
          }

          continue;
        }

        // TODO: optimize, get directly extractCSS module
        // asset supported via the plugin module
        const pluginModule = Options.getModule(sourceFile);
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
          assetFile = Options.resolveOutputFilename(assetFile, pluginModule.outputPath);
        }

        Resolver.addAsset({ resource: sourceRequest, filename: assetFile });

        // extract CSS
        const inline = Collection.isInlineStyle(sourceRequest);

        Collection.setData(this.currentEntryPoint, null, {
          type: Collection.type.style,
          inline,
          resource: sourceRequest,
          assetFile,
        });

        // skip already processed asset except inlined asset
        if (isCached && !inline) {
          continue;
        }

        const moduleOutputPath = pluginModule.outputPath || entry.outputPath;

        assetModules.add({
          type: 'style',
          inline,
          // resourceInfo
          isEntry: false,
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
        AssetResource.saveData(module);
      } else if (module.type === 'asset/inline') {
        AssetInline.saveData(entry, module, chunk, codeGenerationResults);
      } else if (module.type === 'asset/source') {
        // support the source type for SVG only
        if (AssetInline.isSvgFile(sourceFile)) {
          AssetInline.saveData(entry, module, chunk, codeGenerationResults);
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
          sourceFile: entry.request,
          assetFile: entry.filename,
          content,
        }) || content;

      return Options.afterProcess(content, { sourceFile: entry.request, assetFile: entry.filename }) || content;
    };

    Collection.render(compilation, callback);

    // remove all unused assets from compilation
    AssetTrash.clearCompilation(compilation);
  }

  /**
   * Render the module source code generated by a loader.
   *
   * @param {string} type The type of module, one of 'entry', 'style'.
   * @param {boolean} inline Whether the resource should be inlined.
   * @param {Object} source The Webpack source.
   * @param {string} sourceFile The full path of source file w/o URL query.
   * @param {string} sourceRequest The full path of source file with URL query.
   * @param {string} assetFile
   * @param {boolean} isEntry
   * @param {string} outputPath
   * @param {string|function} filenameTemplate
   * @param {ModuleProps} pluginModule
   * @return {string|null} Return rendered HTML or null to not save the rendered content.
   */
  renderModule({
    type,
    inline,
    source,
    sourceFile,
    sourceRequest,
    assetFile,
    isEntry,
    outputPath,
    filenameTemplate,
    pluginModule,
  }) {
    let code = source.source();
    let result;

    if (Buffer.isBuffer(code)) {
      code = code.toString();
    }

    if (code.indexOf('export default') > -1) {
      code = toCommonJS(code);
    }

    /** @type  FileInfo */
    const issuer = {
      resource: sourceRequest,
      filename: assetFile,
    };
    Resolver.setContext(this.currentEntryPoint, issuer);

    const contextOptions = {
      require: Resolver.require,
      // the `module.id` is required for `css-loader`, in module extract CSS expected as the source path
      module: { id: sourceFile },
      // required for ssr
      __filename: sourceFile,
    };

    try {
      const script = new vm.Script(code, { filename: sourceFile });
      const contextObject = vm.createContext(contextOptions);
      const compiledCode = script.runInContext(contextObject) || '';
      result = isFunction(compiledCode) ? compiledCode() : compiledCode;
    } catch (error) {
      executeTemplateFunctionException(error, sourceFile);
    }

    if (pluginModule) {
      if (pluginModule.extract) {
        result = pluginModule.extract(this.compilation, { source: result, assetFile, inline });
      }
      if (pluginModule.postprocess) {
        const resourceInfo = {
          isEntry,
          inline,
          verbose: Options.isVerbose(),
          outputPath,
          sourceFile,
          assetFile,
          filename: filenameTemplate,
        };
        try {
          result = pluginModule.postprocess(result, resourceInfo, this.compilation);
        } catch (error) {
          postprocessException(error, resourceInfo);
        }
      }

      if (inline && type === 'style') {
        Collection.setDataSource(this.currentEntryPoint, sourceRequest, result);
        return null;
      }
    }

    return result;
  }

  /**
   * Execute after compilation.
   * Reset initial settings and caches by webpack serve/watch, display verbose.
   *
   * @param {Object} stats
   */
  done(stats) {
    if (Options.isVerbose()) verbose();

    Asset.reset();
    AssetEntry.reset();
    AssetScript.reset();
    AssetTrash.reset();
    Resolver.reset();
    PluginService.reset();
  }

  /**
   * Called when the compiler is closing or a watching compilation has stopped.
   */
  shutdown() {
    PluginService.shutdown();
  }
}

module.exports = AssetCompiler;
