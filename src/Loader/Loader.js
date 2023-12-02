const PluginService = require('../Plugin/PluginService');
const Option = require('./Option');
const Resolver = require('./Resolver');
const Compile = require('./Modes/Compile');
const Render = require('./Modes/Render');

class Loader {
  /** @type {Render|Compile} */
  static compiler = null;

  /**
   * @param {BundlerPluginLoaderContext} loaderContext
   */
  static init(loaderContext) {
    const { rootContext, hot } = loaderContext;
    const { preprocessor, preprocessorMode, esModule, self: useSelf } = Option.get();

    // prevent double initialization with same options, it occurs when many entry files used in one webpack config
    if (!PluginService.isCached(rootContext)) {
      Resolver.init(loaderContext);
    }

    this.compiler = this.factory({
      preprocessor,
      preprocessorMode,
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
   * @param {{}} preprocessor The preprocessor option.
   * @param {string} preprocessorMode The loader mode: compile or render.
   * @param {boolean} esModule
   * @param {boolean} useSelf Whether the `self` option is true.
   * @param {boolean} hot Whether the `hot` option of the `devServer` is enabled to page live reload.
   * @return {Render|Compile}
   */
  static factory({ preprocessor, preprocessorMode, esModule, useSelf, hot }) {
    switch (preprocessorMode) {
      case 'compile':
        return new Compile({ preprocessor, esModule, hot });
      case 'render':
      default:
        return new Render({ preprocessor, esModule, hot });
    }
  }

  /**
   * Export generated result.
   *
   * @param {string} content
   * @param {BundlerPluginLoaderContext} loaderContext
   * @return {string}
   */
  static export(content, loaderContext) {
    return this.compiler.export(content, loaderContext);
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
