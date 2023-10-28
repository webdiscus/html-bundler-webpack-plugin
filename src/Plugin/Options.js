const path = require('path');
const { isWin, isFunction, pathToPosix } = require('../Common/Helpers');
const LoaderOptions = require('../Loader/Options');
const { postprocessException, afterProcessException } = require('./Messages/Exception');

const pluginName = require('../config');

/**
 * @typedef {Object} JsOptions
 * @property {string|null} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} [filename = '[name].js'] The output filename of extracted JS.
 * @property {string|function(PathData, AssetInfo): string} [chunkFilename = '[id].js'] The output filename of non-initial chunk files.
 * @property {boolean|string} [inline = false] Whether the compiled JS should be inlined.
 */

/**
 * @typedef {Object} CssOptions
 * @property {RegExp} test RegEx to match style files.
 * @property {string|null} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} [filename = '[name].css'] The file name of output file.
 * @property {string|function(PathData, AssetInfo): string} [chunkFilename = filename] The output filename of non-initial chunk files, e.g., styles imported in js.
 * @property {boolean|string} [inline = false] Whether the compiled CSS should be inlined.
 */

class Options {
  static pluginName = pluginName;
  /** @type {PluginOptions} */
  static options = {};
  /** @type {AssetEntry} */
  static assetEntry = null;
  static webpackOptions = {};
  static productionMode = true;
  static dynamicEntry = false;
  static cacheable = false;
  static context = '';
  static js = {
    test: /\.(js|ts|jsx|tsx|mjs|cjs|mts|cts)$/,
    enabled: true,
    filename: undefined, // used output.filename
    chunkFilename: undefined, // used output.chunkFilename
    outputPath: undefined,
    inline: false,
  };
  static css = {
    test: /\.(css|scss|sass|less|styl)$/,
    enabled: true,
    filename: '[name].css',
    chunkFilename: undefined,
    outputPath: undefined,
    inline: false,
  };

  /**
   * Initialize plugin options.
   *
   * @param {Object} options The plugin options.
   * @param {AssetEntry} assetEntry The instance of the AssetEntry class.
   *  Note: this file cannot be imported due to a circular dependency, therefore, this dependency is injected.
   */
  static init(options, { assetEntry }) {
    this.options = options;
    this.assetEntry = assetEntry;
    this.options.css = { ...this.css, ...this.options.css };
    this.options.js = { ...this.js, ...this.options.js };

    this.options.afterProcess = isFunction(options.afterProcess) ? options.afterProcess : null;
    this.options.postprocess = isFunction(options.postprocess) ? options.postprocess : null;

    if (!options.watchFiles) this.options.watchFiles = {};
    this.options.hotUpdate = this.options.hotUpdate === true;
  }

  /**
   * Initialize Webpack options.
   *
   * @param {Object} options The Webpack compiler options.
   */
  static initWebpack(options) {
    const { entry, js, css } = this.options;

    this.#initWebpackOutput(options.output);

    this.webpackOptions = options;
    this.productionMode = options.mode == null || options.mode === 'production';
    this.verbose = this.toBool(this.options.verbose, false, false);
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
    } else {
      js.inline = {
        enabled: this.toBool(js.inline, false, this.js.inline),
        chunk: undefined,
        source: undefined,
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
  }

  static initWatchMode() {
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
  static #initWebpackOutput(output) {
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
  static isProduction() {
    return this.productionMode;
  }

  /**
   * @return {boolean}
   */
  static isDynamicEntry() {
    return this.dynamicEntry;
  }

  /**
   * @return {boolean}
   */
  static isEnabled() {
    return this.options.enabled !== false;
  }

  /**
   * @return {boolean}
   */
  static isMinify() {
    return this.options.minify;
  }

  /**
   * @return {boolean}
   */
  static isVerbose() {
    return this.verbose === true;
  }

  /**
   * @return {boolean}
   */
  static isExtractComments() {
    return this.options.extractComments === true;
  }

  /**
   * @return {boolean}
   */
  static isIntegrityEnabled() {
    return this.options.integrity.enabled !== false;
  }

  /**
   * @param {string} resource
   * @return {boolean}
   */
  static isStyle(resource) {
    const [file] = resource.split('?', 1);
    return this.options.css.enabled && this.options.css.test.test(file);
  }

  /**
   * @param {string} resource
   * @return {boolean}
   */
  static isScript(resource) {
    const [file] = resource.split('?', 1);
    return this.options.js.enabled && this.options.js.test.test(file);
  }

  /**
   * @return {boolean}
   */
  static isRealContentHash() {
    return this.webpackOptions.optimization.realContentHash === true;
  }

  /**
   * @return {boolean}
   */
  static isCacheable() {
    return this.cacheable;
  }

  /**
   * Whether the JS chunk should be inlined.
   *
   * @param {string} resource The resource file, including a query.
   * @param {string} chunk The chunk filename.
   * @return {boolean}
   */
  static isInlineJs(resource, chunk) {
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
   * Whether the CSS resource should be inlined.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  static isInlineCss(resource) {
    const [, query] = resource.split('?', 2);
    const urlParams = new URLSearchParams(query);
    const value = urlParams.get('inline');

    return this.toBool(value, false, this.options.css.inline);
  }

  /**
   * Whether the source file is a template entry file.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  static isEntry(resource) {
    if (resource == null) return false;

    const [file] = resource.split('?', 1);

    return this.options.test.test(file);
  }

  /**
   * Whether the preload option is defined.
   *
   * @return {boolean}
   */
  static isPreload() {
    return this.options.preload != null && this.options.preload !== false;
  }

  static isAutoPublicPath() {
    return this.autoPublicPath === true;
  }

  static isRootPublicPath() {
    return this.rootPublicPath === true;
  }

  /**
   * @return {string}
   */
  static getPublicPath() {
    return this.webpackPublicPath;
  }

  /**
   * Resolve undefined|true|false|''|'auto' value depend on current Webpack mode dev/prod.
   *
   * @param {boolean|string|undefined} value The value one of the values: true, false, 'auto'.
   * @param {boolean} autoValue Returns the autoValue in prod mode when value is 'auto'.
   * @param {boolean|string} defaultValue Returns default value when value is undefined.
   * @return {boolean}
   */
  static toBool(value, autoValue, defaultValue) {
    if (value == null) value = defaultValue;
    // note: if a parameter is defined without a value or value is empty, then the value is true
    if (value === '' || value === 'true') return true;
    if (value === 'false') return false;
    if (value === true || value === false) return value;

    return value === 'auto' && this.productionMode === autoValue;
  }

  static get() {
    return this.options;
  }

  static getLF() {
    return this.isMinify() ? '' : '\n';
  }

  /**
   * @return {RegExp}
   */
  static getFilterRegexp() {
    return this.options.test;
  }

  static getJs() {
    return this.options.js;
  }

  static getCss() {
    return this.options.css;
  }

  static getWatchFiles() {
    return this.options.watchFiles;
  }

  static getPreload() {
    return this.options.preload == null ? false : this.options.preload;
  }

  static getIntegrity() {
    return this.options.integrity;
  }

  static getStyleOptions(sourceFile) {
    if (!this.isStyle(sourceFile)) return null;

    return this.options.css;
  }

  static getEntryOptions(sourceFile) {
    const isEntry = this.isEntry(sourceFile);
    const isStyle = this.isStyle(sourceFile);

    if (!isEntry && !isStyle) return null;

    let { filename, sourcePath, outputPath } = this.options;
    let verbose = Options.isVerbose();

    if (isStyle) {
      const cssOptions = this.options.css;
      if (cssOptions.filename) filename = cssOptions.filename;
      if (cssOptions.sourcePath) sourcePath = cssOptions.sourcePath;
      if (cssOptions.outputPath) outputPath = cssOptions.outputPath;
    }

    return { verbose, filename, sourcePath, outputPath };
  }

  static getWebpackOutputPath() {
    return this.webpackOptions.output.path;
  }

  /**
   * Get the output path of the asset.
   *
   * @param {string | null} assetFile The output asset filename relative by output path.
   * @return {string}
   */
  static getAssetOutputPath(assetFile = null) {
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
  static getAssetOutputFile(assetFile, issuer) {
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
  static getRootSourcePaths() {
    const watchDirs = LoaderOptions.getWatchPaths();

    return watchDirs || [];
  }

  /**
   * Get the entry path.
   *
   * @return {string|null}
   */
  static getEntryPath() {
    return this.dynamicEntry ? this.options.entry : null;
  }

  static hasPostprocess() {
    return this.options.postprocess != null;
  }

  /**
   * @param {string} content A content of processed file.
   * @param {TemplateInfo} info The resource info object.
   * @param {Compilation} compilation The Webpack compilation object.
   * @return {string}
   * @throws
   */
  static postprocess(content, info, compilation) {
    try {
      return this.options.postprocess(content, info, compilation);
    } catch (error) {
      postprocessException(error, info);
    }
  }

  /**
   * TODO:
   *  - add dependencies (entry-point => all assets used in the template) as argument
   *  - test not yet documented experimental feature
   *
   * @param {string} content
   * @param {string} sourceFile
   * @param {string} assetFile
   * @return {string|null}
   * @throws
   */
  static afterProcess(content, { sourceFile, assetFile }) {
    if (!this.options.afterProcess || !this.isEntry(sourceFile)) return null;

    try {
      return this.options.afterProcess(content, { sourceFile, assetFile });
    } catch (error) {
      return afterProcessException(error, sourceFile);
    }
  }

  /**
   * @param {string} type
   */
  static enableLibraryType(type) {
    if (this.webpackOptions.output.enabledLibraryTypes.indexOf(type) < 0) {
      this.webpackOptions.output.enabledLibraryTypes.push(type);
    }
  }

  /**
   * @param {string} filename The output filename.
   * @param {string | null} outputPath The output path.
   * @return {string}
   */
  static resolveOutputFilename(filename, outputPath) {
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

module.exports = Options;
