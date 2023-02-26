const path = require('path');
const extractCss = require('./Modules/extractCss');
const { isFunction, isWin, pathToPosix } = require('./Utils');
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

    let extractCssOptions = extractCss(options.css);
    const moduleExtractCssOptions = options.modules.find((item) => item.test.source === extractCssOptions.test.source);

    if (moduleExtractCssOptions) {
      extractCssOptions = moduleExtractCssOptions;
    } else {
      this.options.modules.unshift(extractCssOptions);
    }

    if (!options.watchFiles) this.options.watchFiles = {};

    this.options.extractJs = options.js || {};
    this.options.extractCss = extractCssOptions;
    this.options.afterProcess = isFunction(options.afterProcess) ? options.afterProcess : null;
  }

  /**
   * Initialize Webpack options.
   *
   * @param {Object} options
   */
  static initWebpack(options) {
    const webpackOutput = options.output;
    const { extractJs } = this.options;

    this.webpackOptions = options;
    this.rootPath = options.context;
    this.prodMode = options.mode == null || options.mode === 'production';
    this.verbose = this.isTrue(this.options.verbose, false);
    extractJs.verbose = this.isTrue(extractJs.verbose, false);
    extractCss.verbose = this.isTrue(extractCss.verbose, false);

    if (!webpackOutput.path) webpackOutput.path = path.join(this.context, 'dist');

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

  static isProdMode() {
    return this.prodMode === true;
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
   * Whether the source file is an entry file.
   *
   * @param {string} sourceFile
   * @return {boolean}
   */
  static isEntry(sourceFile) {
    const [file] = sourceFile.split('?', 1);
    return this.options.test.test(file);
  }

  static isTrue(value, defaultValue) {
    if (value == null) return defaultValue;

    return value === true || (this.prodMode === true && value === 'auto');
  }

  static get() {
    return this.options;
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

  /**
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
      // TODO: test not yet documented experimental feature and rename it to other name
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
