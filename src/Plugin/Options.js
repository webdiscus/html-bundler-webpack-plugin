const fs = require('fs');
const path = require('path');
const { isWin, isFunction, pathToPosix } = require('../Common/Helpers');
const { readDirRecursiveSync } = require('../Common/FileUtils');
const { optionEntryPathException, postprocessException, afterProcessException } = require('./Messages/Exception');

/**
 * @typedef {Object} PluginOptions
 * @property {RegExp} test The search for a match of entry files.
 * @property {boolean} [enabled = true] Enable/disable the plugin.
 * @property {boolean|string} [verbose = false] Show the information at processing entry files.
 * @property {string} [sourcePath = options.context] The absolute path to sources.
 * @property {string} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} filename The file name of output file.
 *  See https://webpack.js.org/configuration/output/#outputfilename.
 *  Must be an absolute or a relative by the context path.
 * @property {CssOptions=} css The options for embedded plugin module to extract CSS.
 * @property {JsOptions=} js The options for embedded plugin module to extract CSS.
 * @property {function(string, ResourceInfo, Compilation): string|null =} postprocess The post-process for extracted content from entry.
 * @property {function(content: string, {sourceFile: string, assetFile: string})} afterProcess Called after processing all plugins.
 * @property {boolean} [extractComments = false] Whether comments should be extracted to a separate file.
 *  If the original filename is foo.js, then the comments will be stored to foo.js.LICENSE.txt.
 *  This option enable/disable storing of *.LICENSE.txt file.
 *  For more flexibility use terser-webpack-plugin https://webpack.js.org/plugins/terser-webpack-plugin/#extractcomments.
 * @property {Object|string} entry The entry points.
 *  The key is route to output file w/o an extension, value is a template source file.
 *  When the entry is a string, this should be a relative or absolute path to pages.
 * @property {{paths: Array<string>, files: Array<RegExp>, ignore: Array<RegExp>}} watchFiles Paths and files to watch file changes.
 * @property {Object=} loaderOptions Options defined in plugin but provided for the loader.
 * @property {Array<Object>|boolean=} preload Options to generate preload link tags for assets.
 * @property {boolean|Object|'auto'|null} [minify = false] Minify generated HTML.
 * @property {boolean|Object|'auto'|null} [minifyOptions = null] Minification options, it is used for auto minify.
 */

/**
 * @typedef {Object} JsOptions
 * @property {string|null} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} [filename = '[name].js'] The output filename of extracted JS.
 * @property {string|function(PathData, AssetInfo): string} [chunkFilename = '[id].js'] The output filename of non-initial chunk files.
 * @property {boolean|string} [`inline` = false] Whether the compiled JS should be inlined.
 */

/**
 * @typedef {Object} CssOptions
 * @property {RegExp} test RegEx to match style files.
 * @property {string|null} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} [filename = '[name].js'] The file name of output file.
 * @property {boolean|string} [`inline` = false] Whether the compiled CSS should be inlined.
 */

class Options {
  /** @type {PluginOptions} */
  static options = {};
  static webpackOptions = {};
  static prodMode = true;
  static context = '';
  static rootContext = '';

  /**
   * Initialize plugin options.
   *
   * @param {Object} options
   * @param {AssetEntry} AssetEntry The instance of the AssetEntry class.
   *  Note: this file cannot be imported due to a circular dependency, therefore, this dependency is injected.
   */
  static init(options, { AssetEntry }) {
    this.options = options;
    this.AssetEntry = AssetEntry;
    this.options.afterProcess = isFunction(options.afterProcess) ? options.afterProcess : null;
    this.options.postprocess = isFunction(options.postprocess) ? options.postprocess : null;

    if (!options.js) this.options.js = {};
    if (!options.watchFiles) this.options.watchFiles = {};
  }

  /**
   * Initialize Webpack options.
   *
   * @param {Object} options
   */
  static initWebpack(options) {
    const webpackOutput = options.output;
    const { js, css } = this.options;

    this.webpackOptions = options;
    this.rootContext = options.context;
    this.prodMode = options.mode == null || options.mode === 'production';
    this.verbose = this.toBool(this.options.verbose, false, false);
    js.inline = this.toBool(js.inline, false, false);
    css.inline = this.toBool(css.inline, false, false);

    this.#initWebpackOutput(webpackOutput);

    if (js.filename) {
      webpackOutput.filename = js.filename;
    } else {
      js.filename = webpackOutput.filename;
    }

    if (js.chunkFilename) {
      webpackOutput.chunkFilename = js.chunkFilename;
    } else {
      js.chunkFilename = webpackOutput.chunkFilename || '[id].js';
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

      webpackOutput.filename = js.filename;
      webpackOutput.chunkFilename = js.chunkFilename;
    } else {
      js.outputPath = webpackOutput.path;
    }

    if (!this.options.sourcePath) this.options.sourcePath = this.rootContext;
    if (!this.options.outputPath) this.options.outputPath = webpackOutput.path;

    // options.entry
    this.#initWebpackEntry();
  }

  /**
   * Set default CSS options.
   *
   * @param {Object} options The default options.
   */
  static setDefaultCssOptions(options) {
    this.options.css = { ...options, ...this.options.css };
    if (!this.options.css.outputPath) this.options.css.outputPath = this.options.outputPath;
  }

  static initWatchMode() {
    const { publicPath } = this.webpackOptions.output;
    if (publicPath == null || publicPath === 'auto') {
      // By using watch/serve browsers not support an automatic publicPath in HMR script injected into inlined JS,
      // the output.publicPath must be an empty string.
      this.webpackOptions.output.publicPath = '';
    }
  }

  static #initWebpackOutput(output) {
    let { publicPath } = output;
    if (!output.path) output.path = path.join(this.context, 'dist');

    // define js output filename
    if (!output.filename) {
      output.filename = '[name].js';
    }

    if (typeof publicPath === 'function') {
      publicPath = publicPath.call(null, {});
    }
    if (publicPath === undefined) {
      publicPath = 'auto';
    }

    // reset initial states
    this.autoPublicPath = false;
    this.isUrlPublicPath = false;
    this.isRelativePublicPath = false;
    this.webpackPublicPath = publicPath;
    this.webpackOutputPath = output.path;

    if (publicPath === 'auto') {
      this.autoPublicPath = true;
    } else if (/^(\/\/|https?:\/\/)/i.test(publicPath)) {
      this.isUrlPublicPath = true;
    } else if (!publicPath.startsWith('/')) {
      this.isRelativePublicPath = true;
    }
  }

  /**
   * Entries defined in plugin options are merged with a Webpack entry option.
   */
  static #initWebpackEntry() {
    let { entry } = this.webpackOptions;
    let pluginEntry = this.options.entry;

    // check whether the entry in config is empty, defaults Webpack set structure: `{ main: {} }`,
    if (Object.keys(entry).length === 1 && Object.keys(Object.entries(entry)[0][1]).length === 0) {
      // set empty entry to avoid Webpack error
      entry = {};
    }

    if (pluginEntry) {
      if (typeof pluginEntry === 'string') {
        let dir = pluginEntry;
        if (!path.isAbsolute(dir)) {
          dir = path.join(this.rootContext, dir);
        }
        pluginEntry = this.readEntryDir(dir);
      }

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

      this.webpackOptions.entry = { ...entry, ...pluginEntry };
    }

    // the 'layer' entry property is only allowed when 'experiments.layers' is enabled
    this.webpackOptions.experiments.layers = true;
  }

  /**
   * Returns templates read recursively from the entry path.
   *
   * @param {string} dir
   * @return {Object}
   * @throws
   */
  static readEntryDir(dir) {
    try {
      if (!fs.lstatSync(dir).isDirectory()) optionEntryPathException(dir);
    } catch (error) {
      optionEntryPathException(dir);
    }

    const entry = {};
    const files = readDirRecursiveSync(dir, { fs, includes: [this.options.test] });

    files.forEach((file) => {
      let outputFile = path.relative(dir, file);
      let key = outputFile.slice(0, outputFile.lastIndexOf('.'));
      entry[key] = file;
    });

    return entry;
  }

  static isEnabled() {
    return this.options.enabled !== false;
  }

  static isMinify() {
    return this.toBool(this.options.minify, true, false);
  }

  static isVerbose() {
    return this.verbose;
  }

  static isExtractComments() {
    return this.options.extractComments === true;
  }

  static isStyle(file) {
    return this.options.css.enabled && this.options.css.test.test(file);
  }

  /**
   * Whether the resource should be inlined.
   *
   * @param {string} resource The resource file, including a query.
   * @param {boolean} defaultValue When a resource query doesn't have the `inline` parameter then return default value.
   * @return {boolean}
   */
  static #isInlineResource(resource, defaultValue) {
    const [, query] = resource.split('?', 2);
    const value = new URLSearchParams(query).get('inline');

    return this.toBool(value, false, defaultValue);
  }

  /**
   * Whether the JS resource should be inlined.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  static isInlineJs(resource) {
    return this.#isInlineResource(resource, this.options.js.inline);
  }

  /**
   * Whether the CSS resource should be inlined.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  static isInlineCss(resource) {
    return this.#isInlineResource(resource, this.options.css.inline);
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
   * @param {boolean} defaultValue Returns default value when value is undefined.
   * @return {boolean}
   */
  static toBool(value, autoValue, defaultValue) {
    if (value == null) return defaultValue;
    // note: if a parameter is defined without a value or value is empty, then the value is true
    if (value === '' || value === 'true') return true;
    if (value === 'false') return false;
    if (value === true || value === false) return value;

    return value === 'auto' && this.prodMode === autoValue;
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
    const isAutoRelative = assetFile && this.isRelativePublicPath && !this.AssetEntry.isEntrypoint(assetFile);

    if (this.autoPublicPath || isAutoRelative) {
      if (!assetFile) return '';

      const fullFilename = path.resolve(this.webpackOutputPath, assetFile);
      const context = path.dirname(fullFilename);
      const publicPath = path.relative(context, this.webpackOutputPath) + '/';

      return isWin ? pathToPosix(publicPath) : publicPath;
    }

    return this.webpackPublicPath;
  }

  static hasPostprocess() {
    return this.options.postprocess != null;
  }

  /**
   * @param {string} content A content of processed file.
   * @param {ResourceInfo} info The resource info object.
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
   * Get the output asset file regards the publicPath.
   *
   * @param {string} assetFile The output asset filename relative by output path.
   * @param {string} issuer The output issuer filename relative by output path.
   * @return {string}
   */
  static getAssetOutputFile(assetFile, issuer) {
    const isAutoRelative = issuer && this.isRelativePublicPath && !this.AssetEntry.isEntrypoint(issuer);

    // if the public path is relative, then a resource using not in the template file must be auto resolved
    if (this.autoPublicPath || isAutoRelative) {
      if (!issuer) return assetFile;

      const issuerFullFilename = path.resolve(this.webpackOutputPath, issuer);
      const context = path.dirname(issuerFullFilename);
      const file = path.posix.join(this.webpackOutputPath, assetFile);
      const outputFilename = path.relative(context, file);

      return isWin ? pathToPosix(outputFilename) : outputFilename;
    }

    return this.webpackPublicPath + '' + assetFile;
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
