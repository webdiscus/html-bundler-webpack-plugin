const AssetCompiler = require('./Plugin/AssetCompiler');

/**
 * @typedef {Object} PluginOptions
 * @property {RegExp} [test = /\.(html)$/] The search for a match of entry files.
 * @property {boolean} [enabled = true] Enable/disable the plugin.
 * @property {boolean} [verbose = false] Show the information at processing entry files.
 * @property {boolean} [minify = false] Minify generated HTML.
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
      test: /\.(html)$/,
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
   * Override abstract method.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @param {string} sourceFile
   * @param {string} assetFile
   * @param {string} source
   * @return {string|undefined}
   */
  afterProcess(compilation, { sourceFile, assetFile, source }) {
    if (this.options.minify === true && sourceFile && this.isEntry(sourceFile) && typeof source === 'string') {
      // TODO: minify source
    }
  }
}

module.exports = Plugin;
module.exports.loader = require.resolve('./Loader');
