const path = require('path');
const Compilation = require('webpack/lib/Compilation');
const { isWin, isFunction, pathToPosix } = require('../Common/Helpers');
const { postprocessException, beforeEmitException } = require('./Messages/Exception');
const { optionSplitChunksChunksAllWarning } = require('./Messages/Warnings');

const Preprocessor = require('../Loader/Preprocessor');
const PluginService = require('../Plugin/PluginService');

class Option {
  /** @type {HtmlBundlerPlugin.PluginOptions} */
  options = {};
  /** @type {AssetEntry} */
  assetEntry = null;
  webpackOptions = {};
  productionMode = true;
  dynamicEntry = false;
  cacheable = false;
  context = '';
  testEntry = null;
  compiler = null;
  devServerHot = false;

  js = {
    test: /\.(js|ts|jsx|tsx|mjs|cjs|mts|cts)$/,
    enabled: true,
    filename: undefined, // used output.filename
    chunkFilename: undefined, // used output.chunkFilename
    outputPath: undefined,
    inline: false,
  };

  css = {
    test: /\.(css|scss|sass|less|styl)$/,
    enabled: true,
    filename: '[name].css',
    chunkFilename: undefined,
    outputPath: undefined,
    inline: false,
    hot: false,
  };

  #entryLibrary = {
    name: 'return',
    type: 'jsonp', // compiles JS from source into HTML string via Function()
  };

  /**
   * The pipeline of processes.
   * The result of one will be passed into next.
   *
   * @type {Map<string, Array<Function>>}
   */
  #process = new Map();

  /**
   * Initialize plugin options.
   *
   * @param {Object} pluginContext
   * @param {HtmlBundlerPlugin.PluginOptions} options The plugin options.
   * @param {string} loaderPath The absolute path of the loader.
   *  Note: this file cannot be imported due to a circular dependency, therefore, this dependency is injected.
   */
  constructor(pluginContext, { options, loaderPath }) {
    this.pluginContext = pluginContext;
    this.loaderPath = loaderPath;
    this.options = options;
    this.testEntry = null;
    this.entryFilter = options.entryFilter;
    this.options.css = { ...this.css, ...this.options.css };
    this.options.js = { ...this.js, ...this.options.js };

    const loaderOptions = this.options.loaderOptions;

    // remove cached data from previous webpack running
    this.#process.clear();

    // add reference for the preprocessor option into the plugin options
    if (loaderOptions && loaderOptions.preprocessor != null) {
      options.preprocessor = loaderOptions.preprocessor;

      if (loaderOptions.preprocessorOptions != null) {
        options.preprocessorOptions = loaderOptions.preprocessorOptions;
      }
    }

    if (!isFunction(options.postprocess)) this.options.postprocess = null;
    if (!isFunction(options.beforeEmit)) this.options.beforeEmit = null;
    if (!isFunction(options.afterEmit)) this.options.afterEmit = null;

    if (this.options.postprocess != null) {
      this.addProcess('postprocess', this.options.postprocess);
    }

    if (!options.watchFiles) this.options.watchFiles = {};
    this.options.hotUpdate = this.options.hotUpdate === true;
  }

  /**
   * Initialize Webpack options.
   *
   * @param {Object} compiler The Webpack compiler.
   */
  initWebpack(compiler) {
    const { entry, js, css } = this.options;
    const options = compiler.options;
    const splitChunks = options?.optimization?.splitChunks?.chunks;

    if (splitChunks && splitChunks === 'all') {
      delete options.optimization.splitChunks.chunks;
      optionSplitChunksChunksAllWarning();
    }

    this.compiler = compiler;
    this.assetEntry = this.pluginContext.assetEntry;
    this.#initWebpackOutput(options.output);

    this.webpackOptions = options;
    this.productionMode = options.mode == null || options.mode === 'production';
    this.options.verbose = this.toBool(this.options.verbose, false, false);
    this.context = options.context;
    this.cacheable = options.cache?.type === 'filesystem';

    if (!this.options.sourcePath) this.options.sourcePath = this.context;
    if (!this.options.outputPath) this.options.outputPath = options.output.path;
    else if (!path.isAbsolute(this.options.outputPath))
      this.options.outputPath = path.resolve(options.output.path, this.options.outputPath);

    // set the absolute path for dynamic entry
    this.dynamicEntry = typeof entry === 'string';
    if (this.dynamicEntry && !path.isAbsolute(entry)) {
      this.options.entry = path.join(this.context, entry);
    }

    if (Object.keys(options.entry).length === 1 && Object.keys(Object.entries(options.entry)[0][1]).length === 0) {
      // set the empty object to avoid Webpack error, defaults the structure is `{ main: {} }`,
      this.webpackOptions.entry = {};
    }

    css.enabled = this.toBool(css.enabled, true, this.css.enabled);
    css.inline = this.toBool(css.inline, false, this.css.inline);

    if (!css.outputPath) css.outputPath = options.output.path;

    if (!css.chunkFilename) {
      css.chunkFilename = css.filename;
    }

    js.enabled = this.toBool(js.enabled, true, this.js.enabled);

    if (js.inline && typeof js.inline === 'object') {
      js.inline.enabled = this.toBool(js.inline.enabled, false, true);
      if (js.inline.chunk && !Array.isArray(js.inline.chunk)) {
        js.inline.chunk = [js.inline.chunk];
      }
      if (js.inline.source && !Array.isArray(js.inline.source)) {
        js.inline.source = [js.inline.source];
      }
      if (typeof js.inline.attributeFilter !== 'function') {
        js.inline.attributeFilter = undefined;
      }
    } else {
      js.inline = {
        enabled: this.toBool(js.inline, false, this.js.inline),
        chunk: undefined,
        source: undefined,
        attributeFilter: undefined,
      };
    }

    if (js.filename) {
      options.output.filename = js.filename;
    } else {
      js.filename = options.output.filename;
    }

    if (js.chunkFilename) {
      options.output.chunkFilename = js.chunkFilename;
    } else {
      js.chunkFilename = options.output.chunkFilename;
    }

    // resolve js filename by outputPath
    if (js.outputPath) {
      const { filename, chunkFilename } = js;

      js.filename = isFunction(filename)
        ? (pathData, assetInfo) => this.resolveOutputFilename(filename(pathData, assetInfo), js.outputPath)
        : this.resolveOutputFilename(js.filename, js.outputPath);

      js.chunkFilename = isFunction(chunkFilename)
        ? (pathData, assetInfo) => this.resolveOutputFilename(chunkFilename(pathData, assetInfo), js.outputPath)
        : this.resolveOutputFilename(js.chunkFilename, js.outputPath);

      options.output.filename = js.filename;
      options.output.chunkFilename = js.chunkFilename;
    } else {
      js.outputPath = options.output.path;
    }

    // normalize integrity options
    const integrity =
      this.options.integrity == null
        ? {}
        : typeof this.options.integrity === 'object'
          ? { enabled: 'auto', ...this.options.integrity }
          : { enabled: this.options.integrity };

    integrity.enabled = this.toBool(integrity.enabled, true, false);
    if (this.options.integrity?.hashFunctions != null) {
      if (!Array.isArray(this.options.integrity.hashFunctions)) {
        integrity.hashFunctions = [this.options.integrity.hashFunctions];
      }
    } else {
      integrity.hashFunctions = ['sha384'];
    }
    this.options.integrity = integrity;

    // https://github.com/terser/html-minifier-terser#options-quick-reference
    const defaultMinifyOptions = {
      collapseWhitespace: true,
      keepClosingSlash: true,
      removeComments: true,
      removeRedundantAttributes: false, // prevents styling bug when input "type=text" is removed
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true,
    };

    // normalize minify options
    if (this.options.minify != null && typeof this.options.minify === 'object') {
      this.options.minifyOptions = this.options.minify;
      this.options.minify = true;
    } else {
      if (this.options.minifyOptions == null) {
        this.options.minifyOptions = {};
      }
      this.options.minify = this.toBool(this.options.minify, true, false);
    }
    this.options.minifyOptions = { ...defaultMinifyOptions, ...this.options.minifyOptions };

    this.initEntry(this.loaderPath);
    this.enableLibraryType();

    if (options.devServer) {
      // default value of the `hot` is `true`
      // https://webpack.js.org/configuration/dev-server/#devserverhot
      const hot = options.devServer?.hot;
      this.devServerHot = (hot == null || hot === true || hot === 'only') && !this.isProduction();
    }
  }

  /**
   * Init detection of entry files.
   *
   * @param {string} loaderPath The absolute path to loader file.
   */
  initEntry(loaderPath) {
    const preprocessorTest = Preprocessor.getTest(this.options.preprocessor);
    const loaderTests = new Set();

    // detect tests defined in rules
    this.webpackOptions.module.rules.forEach((rule) => {
      let ruleStr = JSON.stringify(rule);

      if (isWin) ruleStr = ruleStr.replaceAll(/\\\\/g, '\\');

      if (ruleStr.indexOf(loaderPath) > -1) {
        loaderTests.add(rule.test);
      }
    });

    if (!this.options.test) {
      // set preprocessor test for default loader if the test plugin option is undefined
      // fallback: if the test option is not defined anywhere
      this.options.test = preprocessorTest ? preprocessorTest : /\.html$/;
    }

    // loader tests from rules have the highest priority, over defined in plugin options
    this.testEntry = loaderTests.size > 0 ? [...loaderTests] : [this.options.test];
    this.normalizedEntryFilter = this.normalizeAdvancedFiler(this.testEntry, this.entryFilter);
  }

  getEntryFilter() {
    return this.normalizedEntryFilter;
  }

  initWatchMode() {
    const { publicPath } = this.webpackOptions.output;
    if (publicPath == null || publicPath === 'auto') {
      // Using watch/serve, browsers not support an automatic publicPath in the 'hot update' script injected into inlined JS,
      // the output.publicPath must be an empty string.
      this.webpackOptions.output.publicPath = '';
    }
  }

  /**
   * @param {WebpackOutputOptions} output
   */
  #initWebpackOutput(output) {
    let { publicPath } = output;
    if (!output.path) output.path = path.join(process.cwd(), 'dist');

    // define js output filename
    if (!output.filename) {
      output.filename = '[name].js';
    }

    if (!output.chunkFilename) {
      output.chunkFilename = '[id].js';
    }

    if (typeof publicPath === 'function') {
      publicPath = publicPath.call(null, {});
    }
    if (publicPath === undefined) {
      publicPath = 'auto';
    }

    this.autoPublicPath = false;
    this.isUrlPublicPath = false;
    this.rootPublicPath = false;
    this.isRelativePublicPath = false;
    this.webpackPublicPath = publicPath;

    if (publicPath === 'auto') {
      this.autoPublicPath = true;
    } else if (/^(\/\/|https?:\/\/)/i.test(publicPath)) {
      this.isUrlPublicPath = true;
    } else if (!publicPath.startsWith('/')) {
      this.isRelativePublicPath = true;
    } else if (publicPath.startsWith('/')) {
      this.rootPublicPath = true;
    }
  }

  /**
   * @return {boolean}
   */
  isProduction() {
    return this.productionMode;
  }

  /**
   * Returns the value of the `devServer.hot` webpack option.
   * @return {boolean}
   */
  isDevServerHot() {
    return this.devServerHot;
  }

  /**
   * Whether HMR for CSS is available.
   *
   * @return {boolean}
   */

  isCssHot() {
    return this.options.css.hot && this.devServerHot;
  }

  /**
   * @return {boolean}
   */
  isDynamicEntry() {
    return this.dynamicEntry;
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return this.options.enabled !== false;
  }

  /**
   * @return {boolean}
   */
  isMinify() {
    return this.options.minify === true;
  }

  /**
   * @return {boolean}
   */
  isVerbose() {
    return this.options.verbose === true;
  }

  /**
   * @return {boolean}
   */
  isExtractComments() {
    return this.options.extractComments === true;
  }

  /**
   * @return {boolean}
   */
  isIntegrityEnabled() {
    return this.options.integrity.enabled !== false;
  }

  /**
   * Whether the file is a template entry file.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  isEntry(resource) {
    if (resource == null) return false;

    const [file] = resource.split('?', 1);

    return this.testEntry.find((test) => test.test(file)) != null;
  }

  /**
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  isStyle(resource) {
    const [file] = resource.split('?', 1);
    return this.options.css.enabled && this.options.css.test.test(file);
  }

  /**
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  isScript(resource) {
    const [file] = resource.split('?', 1);
    return this.options.js.enabled && this.options.js.test.test(file);
  }

  /**
   * @return {boolean}
   */
  isRealContentHash() {
    return this.webpackOptions.optimization.realContentHash === true;
  }

  /**
   * @return {boolean}
   */
  isCacheable() {
    return this.cacheable;
  }

  /**
   * Whether the JS chunk should be inlined.
   *
   * @param {string} resource The resource file, including a query.
   * @param {string} chunk The chunk filename.
   * @return {boolean}
   */
  isInlineJs(resource, chunk) {
    const [, query] = resource.split('?', 2);
    const urlParams = new URLSearchParams(query);
    const { inline } = this.options.js;

    if (urlParams.has('inline')) {
      const value = urlParams.get('inline');
      return this.toBool(value, false, inline.enabled);
    }

    if (!inline.source && !inline.chunk) return inline.enabled;

    // regard filter only if the source or chunk is defined
    const inlineSource = inline.source && inline.source.some((test) => resource.match(test));
    const inlineChunk = inline.chunk && inline.chunk.some((test) => chunk.match(test));

    return inline.enabled && (inlineSource || inlineChunk);
  }

  /**
   * Whether the CSS resource should be inlined, regard of the global css.inline option and the file query.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  isInlineCss(resource) {
    const [, query] = resource.split('?', 2);
    const urlParams = new URLSearchParams(query);
    const value = urlParams.get('inline');
    const hasQueryInline = value != null;
    const isInlinedByQuery = this.toBool(value, false, false);

    return (this.options.css.inline && (isInlinedByQuery || !hasQueryInline)) || isInlinedByQuery;
  }

  /**
   * Whether the preload option is defined.
   *
   * @return {boolean}
   */
  isPreload() {
    return this.options.preload != null && this.options.preload !== false;
  }

  isAutoPublicPath() {
    return this.autoPublicPath === true;
  }

  isRootPublicPath() {
    return this.rootPublicPath === true;
  }

  hasPostprocess() {
    return this.#process.has('postprocess');
  }

  hasBeforeEmit() {
    return this.options.beforeEmit != null;
  }

  hasAfterEmit() {
    return this.options.afterEmit != null;
  }

  /**
   * Resolve undefined|true|false|''|'auto' value depend on current Webpack mode dev/prod.
   *
   * @param {boolean|string|undefined} value The value one of the values: true, false, 'auto'.
   * @param {boolean} autoValue Returns the autoValue in prod mode when value is 'auto'.
   * @param {boolean|string} defaultValue Returns default value when value is undefined.
   * @return {boolean}
   */
  toBool(value, autoValue, defaultValue) {
    if (value == null) value = defaultValue;
    // note: if a parameter is defined without a value or value is empty, then the value is true
    if (value === '' || value === 'true') return true;
    if (value === 'false') return false;
    if (value === true || value === false) return value;

    return value === 'auto' && this.productionMode === autoValue;
  }

  /**
   * @return {PluginOptions}
   */
  get() {
    return this.options;
  }

  /**
   * Return LF when minify is disabled and return empty string when minify is enabled.
   *
   * @return {string}
   */
  getLF() {
    return this.isMinify() ? '' : '\n';
  }

  /**
   * @return {Array<RegExp>}
   */
  getEntryTest() {
    return this.testEntry;
  }

  /**
   * Get entry library type.
   * @return {{name: string, type: string}}
   */
  getEntryLibrary() {
    return this.#entryLibrary;
  }

  /**
   * @return {JsOptions}
   */
  getJs() {
    return this.options.js;
  }

  /**
   * @return {CssOptions}
   */
  getCss() {
    return this.options.css;
  }

  /**
   * @return {WatchFiles}
   */
  getWatchFiles() {
    return this.options.watchFiles;
  }

  /**
   * @return {boolean|Preload}
   */
  getPreload() {
    return this.options.preload == null ? false : this.options.preload;
  }

  /**
   * @return {"auto" | boolean | IntegrityOptions}
   */
  getIntegrity() {
    return this.options.integrity;
  }

  /**
   * @param {string} sourceFile
   * @return {CssOptions|null}
   */
  getStyleOptions(sourceFile) {
    if (!this.isStyle(sourceFile)) return null;

    return this.options.css;
  }

  /**
   * @param {string} sourceFile
   * @return {{filename: FilenameTemplate, outputPath: string, sourcePath: (*|string), verbose: boolean}|null}
   */
  getEntryOptions(sourceFile) {
    const isEntry = this.isEntry(sourceFile);
    const isStyle = this.isStyle(sourceFile);

    if (!isEntry && !isStyle) return null;

    let { filename, sourcePath, outputPath } = this.options;
    let verbose = this.isVerbose();

    if (isStyle) {
      const cssOptions = this.options.css;
      if (cssOptions.filename) filename = cssOptions.filename;
      if (cssOptions.sourcePath) sourcePath = cssOptions.sourcePath;
      if (cssOptions.outputPath) outputPath = cssOptions.outputPath;
    }

    return { verbose, filename, sourcePath, outputPath };
  }

  /**
   * @return {string}
   */
  getWebpackOutputPath() {
    return this.webpackOptions.output.path;
  }

  /**
   * @return {string}
   */
  getPublicPath() {
    return this.webpackPublicPath;
  }

  /**
   * Get the output path of the asset.
   *
   * @param {string | null} assetFile The output asset filename relative by output path.
   * @return {string}
   */
  getAssetOutputPath(assetFile = null) {
    const isAutoRelative = assetFile && this.isRelativePublicPath && !this.assetEntry.isEntryFilename(assetFile);

    if (this.autoPublicPath || isAutoRelative) {
      if (!assetFile) return '';

      const fullFilename = path.resolve(this.webpackOptions.output.path, assetFile);
      const context = path.dirname(fullFilename);
      const publicPath = path.relative(context, this.webpackOptions.output.path) + '/';

      return isWin ? pathToPosix(publicPath) : publicPath;
    }

    return this.webpackPublicPath;
  }

  /**
   * Get the output asset file regards the publicPath.
   *
   * @param {string} assetFile The output asset filename relative by output path.
   * @param {string} issuer The output issuer filename relative by output path.
   * @return {string}
   */
  getAssetOutputFile(assetFile, issuer) {
    const isAutoRelative = issuer && this.isRelativePublicPath && !this.assetEntry.isEntryFilename(issuer);

    // if the public path is relative, then a resource using not in the template file must be auto resolved
    if (this.autoPublicPath || isAutoRelative) {
      if (!issuer) return assetFile;

      const issuerFullFilename = path.resolve(this.webpackOptions.output.path, issuer);
      const context = path.dirname(issuerFullFilename);
      const file = path.posix.join(this.webpackOptions.output.path, assetFile);
      const outputFilename = path.relative(context, file);

      return isWin ? pathToPosix(outputFilename) : outputFilename;
    }

    if (this.isUrlPublicPath) {
      const url = new URL(assetFile, this.webpackPublicPath);
      return url.href;
    }

    return path.posix.join(this.webpackPublicPath, assetFile);
  }

  /**
   * Get the top level paths containing source files.
   *
   * Called after compilation, because watch dirs are defined in loader options.
   *
   * The source files can be in many root paths, e.g.:
   *  - ./packages/
   *  - ./src/
   *  - ./vendor/
   *
   * @return {Array<string>}
   */
  getRootSourcePaths() {
    const loaderOption = PluginService.getLoaderOption(this.compiler);

    return loaderOption ? loaderOption.getWatchPaths() : [];
  }

  /**
   * Get the entry path.
   *
   * @return {string|null}
   */
  getEntryPath() {
    return this.dynamicEntry ? this.options.entry : null;
  }

  /**
   * Get stage to render final HTML in the `processAssets` Webpack hook.
   * @return {number|number}
   */
  getRenderStage() {
    // defaults render stage should be earlier then PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
    // because at this stage can be used other plugin which requires already rendered HTML,
    // e.g. `compression-webpack-plugin` will save rendered and minified HTML into gzip

    // NOTE: in specific use cases can be set the `renderStage: Infinity + 1` option
    // to be ensures that the rendering process will be run after all optimizations and other plugins

    let renderStage = this.options.renderStage || Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER - 1;

    // minimal possible stage for the rendering
    // TODO: research a really minimal possible stage,
    //       because, e.g., html-minimizer-webpack-plugin uses the PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE stage,
    //       and render must be called before this minimizer.
    // if (renderStage < Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE) {
    //   renderStage = Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE;
    // }

    return renderStage;
  }

  /**
   * Normalize the filter option defined by user and create inner structure of one.
   *
   * @param {RegExp} test
   * @param {PreloadFilter} filter
   * @return {{includes: RegExp[], excludes: RegExp[], fn: function}}
   */
  normalizeAdvancedFiler(test, filter) {
    const isFunction = typeof filter === 'function';
    let fn = isFunction ? filter : () => true;
    let includes = [];
    let excludes = [];

    if (filter && !isFunction) {
      if (filter instanceof RegExp) {
        includes = [filter];
      } else {
        if (Array.isArray(filter)) {
          includes = filter;
        } else {
          if ('includes' in filter && Array.isArray(filter.includes)) {
            includes = filter.includes;
          }
          if ('excludes' in filter && Array.isArray(filter.excludes)) {
            excludes = filter.excludes;
          }
        }
      }
    }

    return {
      includes,
      excludes,
      fn,
    };
  }

  /**
   * Apply the advanced filter to a value.
   *
   * @param {string | {sourceFiles: Array<string>, outputFile: string}} value
   * @param {NormalizedAdvancedFilter} filter
   * @return {boolean}
   */
  applyAdvancedFiler(value, filter) {
    const { includes, excludes, fn } = filter;

    const hasIncludes = includes.length > 0;
    const hasExcludes = excludes.length > 0;
    const values = [];

    if (typeof filter === 'string') {
      values.push(value);
    } else {
      if ('sourceFiles' in value) values.push(...value.sourceFiles);
      if ('outputFile' in value) values.push(value.outputFile);
    }

    const isIncluded = !hasIncludes || includes.some((regex) => values.some((value) => regex.test(value)));
    const isExcluded = hasExcludes && excludes.some((regex) => values.some((value) => regex.test(value)));

    return isIncluded && !isExcluded && fn(value) !== false;
  }

  /**
   * Add default loader if it yet not defined.
   *
   * @param {{test: RegExp, loader: string}} loader
   */
  addLoader(loader) {
    const loaderPath = loader.loader;
    const existsLoader = this.webpackOptions.module.rules.find((rule) => {
      let ruleStr = JSON.stringify(rule);
      if (isWin) ruleStr = ruleStr.replaceAll(/\\\\/g, '\\');
      return ruleStr.indexOf(loaderPath) > -1;
    });

    if (existsLoader == null) {
      this.webpackOptions.module.rules.unshift(loader);
    }
  }

  /**
   * EnableLibraryPlugin need to be used to enable this type of library.
   * This usually happens through the "output.enabledLibraryTypes" option.
   * If you are using a function as entry which sets "library",
   * you need to add all potential library types to "output.enabledLibraryTypes".
   */
  enableLibraryType() {
    const { type } = this.#entryLibrary;

    if (this.webpackOptions.output.enabledLibraryTypes.indexOf(type) < 0) {
      this.webpackOptions.output.enabledLibraryTypes.push(type);
    }
  }

  /**
   * Add the process to pipeline.
   *
   * @param {string} name The name of process. Currently supported only `postprocess` pipeline.
   * @param {Function: (content: string) => string} fn The process function to modify the generated content.
   */
  addProcess(name, fn) {
    let processes = this.#process.get(name);

    if (!processes) {
      processes = [];
      this.#process.set(name, processes);
    }

    processes.push(fn);
  }

  /**
   * @param {string} name The name of a process.
   * @param {Array<*>} args The arguments of a process.
   * @return {*|null} The result of passed through all processes.
   */
  #runProcesses(name, args) {
    let processPipe = this.#process.get(name);
    let i = 0;
    let result;

    for (; i < processPipe.length; i++) {
      const postprocess = processPipe[i];
      result = postprocess.apply(null, args);

      // the result will be pipelined in the next function as the first argument
      if (result != null) {
        args[0] = result;
      }
    }

    return result;
  }

  /**
   * Called after js template is compiled into html string.
   *
   * @param {string} content A content of processed file.
   * @param {TemplateInfo} info The resource info object.
   * @param {Compilation} compilation The Webpack compilation object.
   * @return {string}
   * @throws
   */
  postprocess(content, info, compilation) {
    try {
      return this.#runProcesses('postprocess', [content, info, compilation]);
    } catch (error) {
      postprocessException(error, info);
    }
  }

  /**
   * Called after processing all plugins, before emit.
   *
   * @param {string} content
   * @param {CompileEntry} entry
   * @param {Compilation} compilation
   * @return {string|null}
   * @throws
   */
  beforeEmit(content, entry, compilation) {
    const { resource } = entry;
    if (!this.options.beforeEmit || !this.isEntry(resource)) return null;

    try {
      return this.options.beforeEmit(content, entry, compilation);
    } catch (error) {
      return beforeEmitException(error, resource);
    }
  }

  /**
   * Called after emitting.
   *
   * TODO: test not yet documented experimental feature
   *
   * @param {CompileEntries} entries
   * @param {Compilation} compilation
   * @return {Promise}
   * @async
   */
  afterEmit(entries, compilation) {
    return new Promise((resolve) => {
      resolve(this.options.afterEmit(entries, compilation));
    });
  }

  /**
   * @param {string} filename The output filename.
   * @param {string | null} outputPath The output path.
   * @return {string}
   */
  resolveOutputFilename(filename, outputPath) {
    if (!outputPath) return filename;

    let relativeOutputPath = path.isAbsolute(outputPath)
      ? path.relative(this.webpackOptions.output.path, outputPath)
      : outputPath;

    if (relativeOutputPath) {
      if (isWin) relativeOutputPath = pathToPosix(relativeOutputPath);
      filename = path.posix.join(relativeOutputPath, filename);
    }

    return filename;
  }
}

module.exports = Option;
