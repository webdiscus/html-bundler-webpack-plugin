const path = require('path');
const extractCssModule = require('./Modules/extractCss');
const { isWin, isFunction, pathToPosix } = require('./Utils');
const { optionModulesException } = require('./Messages/Exception');

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
 * @property {ModuleOptions|{}} css The options for embedded plugin module to extract CSS.
 * @property {ExtractJsOptions|{}} js The options for embedded plugin module to extract CSS.
 * @property {function(string, ResourceInfo, Compilation): string|null =} postprocess The post process for extracted content from entry.
 * @property {function(content: string, {sourceFile: string, assetFile: string})} afterProcess Called after processing all plugins.
 * @property {boolean} [extractComments = false] Whether comments should be extracted to a separate file.
 *  If the original filename is foo.js, then the comments will be stored to foo.js.LICENSE.txt.
 *  This option enable/disable storing of *.LICENSE.txt file.
 *  For more flexibility use terser-webpack-plugin https://webpack.js.org/plugins/terser-webpack-plugin/#extractcomments.
 * @property {Object} entry The entry points. The key is route to output file w/o extension, value is a template source file.
 * @property {{paths: Array<string>, files: Array<RegExp>, ignore: Array<RegExp>}} watchFiles Paths and files to watch file changes.
 * @property {Array<ModuleOptions>=} [modules = []] For inner usage only.
 * @property {Object=} extractJs For inner usage only.
 * @property {Object=} extractCss For inner usage only.
 * @property {Object=} loaderOptions Options defined in plugin but provided for the loader. Experimental.
 */

class Options {
  /** @type {PluginOptions} */
  static options = {};
  static webpackOptions = {};
  static prodMode = true;
  static context = '';

  /**
   * Initialize plugin options.
   *
   * @param {Object} options
   */
  static init(options) {
    this.options = options;

    if (options.modules && !Array.isArray(options.modules)) {
      optionModulesException(options.modules);
    }

    const extractCssOptions = extractCssModule(options.css);

    this.options.modules.unshift(extractCssOptions);
    this.options.extractJs = options.js || {};
    this.options.extractCss = extractCssOptions;
    this.options.afterProcess = isFunction(options.afterProcess) ? options.afterProcess : null;

    if (!options.watchFiles) this.options.watchFiles = {};
  }

  /**
   * Initialize Webpack options.
   *
   * @param {Object} options
   */
  static initWebpack(options) {
    const webpackOutput = options.output;
    const { extractJs, extractCss } = this.options;

    this.webpackOptions = options;
    this.rootPath = options.context;
    this.prodMode = options.mode == null || options.mode === 'production';
    this.verbose = this.toBool(this.options.verbose, false, false);
    extractJs.verbose = this.toBool(extractJs.verbose, false, false);
    extractJs.inline = this.toBool(extractJs.inline, false, false);
    extractCss.verbose = this.toBool(extractCss.verbose, false, false);
    extractCss.inline = this.toBool(extractCss.inline, false, false);

    this.#initWebpackOutput(webpackOutput);

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
    } else {
      extractJs.outputPath = webpackOutput.path;
    }

    if (!this.options.sourcePath) this.options.sourcePath = this.rootPath;
    if (!this.options.outputPath) this.options.outputPath = webpackOutput.path;

    // options.entry
    this.#initWebpackEntry();
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
    this.isAutoPublicPath = false;
    this.isUrlPublicPath = false;
    this.isRelativePublicPath = false;
    this.webpackPublicPath = publicPath;
    this.webpackOutputPath = output.path;

    if (publicPath === 'auto') {
      this.isAutoPublicPath = true;
    } else if (/^(\/\/|https?:\/\/)/i.test(publicPath)) {
      this.isUrlPublicPath = true;
    } else if (!publicPath.startsWith('/')) {
      this.isRelativePublicPath = true;
    }
  }

  /**
   * Entries defined in plugin options are merged with Webpack entry option.
   */
  static #initWebpackEntry() {
    let { entry } = this.webpackOptions;
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

      this.webpackOptions.entry = { ...entry, ...pluginEntry };

      // the 'layer' entry property is only allowed when 'experiments.layers' is enabled
      this.webpackOptions.experiments.layers = true;
    }
  }

  static isEnabled() {
    return this.options.enabled !== false;
  }

  static isDevMode() {
    return this.prodMode === false;
  }

  static isVerbose() {
    return this.verbose;
  }

  static isExtractComments() {
    return this.options.extractComments === true;
  }

  static isStyle(file) {
    return this.options.extractCss.enabled && this.options.extractCss.test.test(file);
  }

  /**
   * Whether the resource should be inlined.
   *
   * @param {string} resource The resource request with a query.
   * @param {boolean} defaultValue When resource query doesn't have the `inline` parameter then return default value.
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
   * @param {string} resource
   * @return {boolean}
   */
  static isInlineJs(resource) {
    return this.#isInlineResource(resource, this.options.extractJs.inline);
  }

  /**
   * Whether the CSS resource should be inlined.
   *
   * @param {string} resource
   * @return {boolean}
   */
  static isInlineCss(resource) {
    return this.#isInlineResource(resource, this.options.extractCss.inline);
  }

  /**
   * Whether the source file is an entry file.
   *
   * @param {string} sourceFile
   * @return {boolean}
   */
  static isEntry(sourceFile) {
    const [file] = sourceFile.split('?', 1);
    return this.options.test.test(file);
  }

  /**
   * Resolve undefined|true|false|''|'auto' value depend on current Webpack mode dev/prod.
   *
   * @param {boolean|string|undefined} value The value one of true, false, 'auto'.
   * @param {boolean} autoValue Returns the autoValue in prod mode when value is 'auto'.
   * @param {boolean} defaultValue Returns default value when value is undefined.
   * @return {boolean}
   */
  static toBool(value, autoValue, defaultValue) {
    if (value == null) return defaultValue;
    // note: if parameter is defined without a value or value is empty then the value is true
    if (value === '' || value === 'true') return true;
    if (value === 'false') return false;
    if (value === true || value === false) return value;

    return value === 'auto' && this.prodMode === autoValue;
  }

  static get() {
    return this.options;
  }

  /**
   * @return {RegExp}
   */
  static getFilterRegexp() {
    return this.options.test;
  }

  static getJs() {
    return this.options.extractJs;
  }

  static getCss() {
    return this.options.extractCss;
  }

  static getWatchFiles() {
    return this.options.watchFiles;
  }

  /**
   * Get plugin module depend on type of source file.
   *
   * @param {string} sourceFile The source file of asset.
   * @returns {ModuleOptions|undefined}
   */
  static getModule(sourceFile) {
    return this.options.modules.find((module) => module.enabled !== false && module.test.test(sourceFile));
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
    let isAutoRelative = assetFile && this.isRelativePublicPath && !assetFile.endsWith('.html');

    if (this.isAutoPublicPath || isAutoRelative) {
      if (!assetFile) return '';

      const fullFilename = path.resolve(this.webpackOutputPath, assetFile);
      const context = path.dirname(fullFilename);
      const publicPath = path.relative(context, this.webpackOutputPath) + '/';

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
    let isAutoRelative = issuer && this.isRelativePublicPath && !issuer.endsWith('.html');

    // if public path is relative, then a resource using not in the template file must be auto resolved
    if (this.isAutoPublicPath || isAutoRelative) {
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
    if (!this.options.afterProcess || !assetFile.endsWith('.html')) return null;

    let result;

    try {
      result = this.options.afterProcess(content, { sourceFile, assetFile });
    } catch (err) {
      throw new Error(err);
    }

    return result;
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
