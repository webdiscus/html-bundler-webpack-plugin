const Config = require('./Common/Config');

// Note: init config before import any source file
Config.init('./config.js');

const AssetCompiler = require('./Plugin/AssetCompiler');
const loader = require.resolve('./Loader');

/**
 * @typedef {PluginOptions} HtmlBundlerPluginOptions
 */

class HtmlBundlerPlugin extends AssetCompiler {
  /**
   * @param {HtmlBundlerPluginOptions|{}} options
   */
  constructor(options = {}) {
    const PluginOptions = {
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
  init(compiler) {
    // TODO: do some thing in an extended plugin
  }
}

module.exports = HtmlBundlerPlugin;
module.exports.loader = loader;
