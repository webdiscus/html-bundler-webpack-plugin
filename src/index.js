const { minify } = require('html-minifier-terser');
const Options = require('./Plugin/Options');
const AssetCompiler = require('./Plugin/AssetCompiler');
const AssetEntry = require('./Plugin/AssetEntry');
const loader = require.resolve('./Loader');
const { isWin } = require('./Common/Helpers');

/**
 * @typedef {PluginOptions} HtmlBundlerPluginOptions
 * @property {boolean|Object|'auto'|null} [minify = false] Minify generated HTML.
 */

class Plugin extends AssetCompiler {
  /**
   * @param {HtmlBundlerPluginOptions|{}} options
   */
  constructor(options = {}) {
    const PluginOptions = {
      test: /\.(html|ejs|eta|hbs|handlebars|njk)$/,
      enabled: true,
      verbose: false,
      minify: false,
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
    const defaultLoader = {
      test: Options.get().test,
      loader,
    };

    const existsLoader = webpackLoaders.find((rule) => {
      let ruleStr = JSON.stringify(rule);
      if (isWin) ruleStr = ruleStr.replaceAll(/\\\\/g, '\\');
      return ruleStr.indexOf(loader) > -1;
    });

    if (existsLoader == null) {
      webpackLoaders.unshift(defaultLoader);
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
    const { compiler, assets } = compilation;
    const { RawSource } = compiler.webpack.sources;
    const promises = [];

    const options = Options.get();
    let isMinify = Options.toBool(options.minify, true, false);
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

    if (isMinify) {
      minifyOptions = defaultMinifyOptions;
    } else if (options.minify !== null && typeof options.minify === 'object') {
      minifyOptions = { ...defaultMinifyOptions, ...options.minify };
    } else {
      return;
    }

    for (const assetFile in assets) {
      if (!AssetEntry.isEntrypoint(assetFile)) {
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
