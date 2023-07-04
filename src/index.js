const { minify } = require('html-minifier-terser');
const Options = require('./Plugin/Options');
const AssetCompiler = require('./Plugin/AssetCompiler');
const AssetEntry = require('./Plugin/AssetEntry');
const loader = require.resolve('./Loader');
const { isWin } = require('./Common/Helpers');

/**
 * @typedef {PluginOptions} HtmlBundlerPluginOptions
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
      minifyOptions: null,
      sourcePath: null,
      outputPath: null,
      filename: '[name].html',
      postprocess: null,
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
   * Called after module sources have been rendered, in the next `processAssets` stage.
   * Override abstract method.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @return {Promise|undefined} Return the promise or undefined.
   * @async
   */
  afterRenderModules(compilation) {
    if (!Options.isMinify()) return;

    const { compiler, assets } = compilation;
    const { RawSource } = compiler.webpack.sources;
    const options = Options.get();
    const promises = [];

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

    const minifyOptions = { ...defaultMinifyOptions, ...options.minifyOptions };

    for (const assetFile in assets) {
      if (!AssetEntry.isEntryFilename(assetFile)) {
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
   * Reserved for the future.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @param {string} sourceFile The resource file of the template.
   * @param {string} assetFile The template output filename.
   * @param {string} content The template content.
   * @return {string|undefined}
   */
  afterProcess(compilation, { sourceFile, assetFile, content }) {
    // at this stage all assets are completely processed with all plugins
  }
}

module.exports = Plugin;
module.exports.loader = loader;
