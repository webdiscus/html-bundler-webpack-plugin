const PluginService = require('../Plugin/PluginService');
const Options = require('./Options');
const Resolver = require('./Resolver');
const RenderMode = require('./Modes/RenderMode');

class Loader {
  static compiler = null;

  /**
   * @param {Object} loaderContext
   */
  static init(loaderContext) {
    const { rootContext, resourcePath: templateFile, hot } = loaderContext;
    const { data, esModule, mode, name: templateName, self: useSelf } = Options.get();

    this.data = data;

    // prevent double initialisation with same options, it occurs when many entry files used in one webpack config
    if (!PluginService.isCached(rootContext)) {
      Resolver.init(loaderContext);
    }

    this.compiler = this.compilerFactory({
      mode,
      templateFile,
      templateName,
      esModule,
      useSelf,
      hot,
    });
  }

  /**
   * Create instance by compilation mode.
   *
   * Note: default mode is `render`
   *
   * @param {string} mode The loader mode: compile or render.
   * @param {string} templateFile
   * @param {string} templateName
   * @param {boolean} esModule
   * @param {boolean} useSelf Whether the `self` option is true.
   * @param {boolean} hot Whether the `hot` option of the `devServer` is enabled to page live reload.
   * @return {RenderMode}
   */
  static compilerFactory({ mode, templateFile, templateName, esModule, useSelf, hot }) {
    switch (mode) {
      case 'render':
      default:
        return new RenderMode({ templateFile, templateName, esModule, hot });
    }
  }

  /**
   * Export generated result.
   *
   * @param {string} source
   * @param {string} issuer
   * @return {string}
   */
  static export(source, issuer) {
    return this.compiler.export(source, this.data, issuer);
  }

  /**
   * Export code with error message.
   *
   * @param {Error} error
   * @param {string} issuer The issuer where the error occurred.
   * @return {string}
   */
  static exportError(error, issuer) {
    return this.compiler?.exportError(error, issuer) || error.toString();
  }
}

module.exports = Loader;
