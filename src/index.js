const Option = require('./Plugin/Option');
const AssetCompiler = require('./Plugin/AssetCompiler');
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
      test: Option.get().test,
      // ignore 'asset/source' with the '?raw' query
      // see https://webpack.js.org/guides/asset-modules/#replacing-inline-loader-syntax
      resourceQuery: { not: [/raw/] },
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
}

module.exports = Plugin;
module.exports.loader = loader;
