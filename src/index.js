const { minify } = require('html-minifier-terser');
const AssetCompiler = require('./Plugin/AssetCompiler');
const loader = require.resolve('./Loader');
const { isWin } = require('./Common/Helpers');

/**
 * @typedef {Object} PluginOptions
 * @property {RegExp} [test = /\.(html)$/] The search for a match of entry files.
 * @property {boolean} [enabled = true] Enable/disable the plugin.
 * @property {boolean} [verbose = false] Show the information at processing entry files.
 * @property {boolean|Object|'auto'|null} [minify = false] Minify generated HTML.
 * @property {string|null} [sourcePath = options.context] The absolute path to sources.
 * @property {string|null} [outputPath = options.output.path] The output directory for an asset.
 * @property {string|function(PathData, AssetInfo): string} [filename = '[name].html'] The file name of output file.
 *   See https://webpack.js.org/configuration/output/#outputfilename.
 *   Must be an absolute or a relative by the context path.
 * @property {function(string, ResourceInfo, Compilation): string|null} postprocess The post process for extracted content from entry.
 * @property {Array<ModuleOptions>} [modules = []]
 * @property {ModuleOptions|{}} css The options for embedded plugin module to extract CSS.
 * @property {ExtractJsOptions|{}} js The options for embedded plugin module to extract CSS.
 * @property {boolean} [`extractComments` = false] Whether comments shall be extracted to a separate file.
 *   If the original filename is foo.js, then the comments will be stored to foo.js.LICENSE.txt.
 *   This option enable/disable storing of *.LICENSE.txt file.
 *   For more flexibility use terser-webpack-plugin https://webpack.js.org/plugins/terser-webpack-plugin/#extractcomments.
 */

class Plugin extends AssetCompiler {
  /**
   * @param {PluginOptions|{}} options
   */
  constructor(options = {}) {
    const PluginOptions = {
      test: /\.(html|ejs)$/,
      enabled: true,
      verbose: false,
      minify: false, // TODO: implement
      sourcePath: null,
      outputPath: null,
      filename: '[name].html',
      postprocess: null,
      modules: [],
      js: {},
      css: {},
      extractComments: false,
    };

    super({
      ...PluginOptions,
      ...options,
    });
  }

  /**
   * Called when a compiler object is initialized.
   * Override abstract method.
   *
   * @param {Compiler} compiler The instance of the webpack compilation.
   */
  initialize(compiler) {
    const webpackLoaders = compiler.options.module.rules;

    // Note: the default templating engine is Eta.
    // Eta is a smaller and faster alternative to EJS with the same syntax.
    const defaultLoader = {
      test: /\.(html|ejs|eta)$/,
      loader,
    };

    const existsLoader = webpackLoaders.find((rule) => {
      let ruleStr = JSON.stringify(rule);
      if (isWin) ruleStr = ruleStr.replaceAll(/\\\\/g, '\\');
      return ruleStr.indexOf(loader) > -1;
    });

    if (existsLoader == null) {
      webpackLoaders.push(defaultLoader);
    }
  }

  /**
   * Called after module sources have been rendered, in the next stage `processAssets`.
   * Override abstract method.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @return {Promise|undefined} Return the promise or undefined.
   * @async
   */
  afterRenderModules(compilation) {
    const options = this.options;
    const { compiler, assets } = compilation;
    const { mode } = compiler.options;
    const { RawSource } = compiler.webpack.sources;
    const isProductionMode = mode == null || mode === 'production';
    const promises = [];
    let minifyOptions;

    // https://github.com/terser/html-minifier-terser#options-quick-reference
    const defaultMinifyOptions = {
      collapseWhitespace: true,
      keepClosingSlash: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true,
    };

    if (options.minify === true || (isProductionMode && options.minify === 'auto')) {
      minifyOptions = defaultMinifyOptions;
    } else if (typeof options.minify === 'object' && options.minify !== null) {
      minifyOptions = { ...defaultMinifyOptions, ...this.options.minify };
    } else {
      return;
    }

    for (const assetFile in assets) {
      if (!assetFile.endsWith('.html')) {
        continue;
      }

      const content = assets[assetFile].source();
      const result = minify(content, minifyOptions);
      const promise = Promise.resolve(result).then((value) => {
        if (typeof value === 'string') {
          compilation.updateAsset(assetFile, new RawSource(value));
        }
      });

      promises.push(promise);
    }

    return Promise.all(promises);
  }

  /**
   * Called after the processAssets hook had finished without error.
   * Override abstract method.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @param {string} sourceFile
   * @param {string} assetFile
   * @param {string} source
   * @return {string|undefined}
   */
  afterProcess(compilation, { sourceFile, assetFile, source }) {
    // at this stage all assets are completely processed with all plugins
  }
}

module.exports = Plugin;
module.exports.loader = loader;
