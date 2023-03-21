const { merge } = require('webpack-merge');
const PluginService = require('../Plugin/PluginService');
const Resolver = require('./Resolver');
const RenderMode = require('./Modes/RenderMode');
const Options = require('./Options');
const { parseQuery } = require('../Common/Helpers');

class Loader {
  static compiler = null;
  static modes = new Set(['render']); // TODO: add compile|compiling, render|rendering and string|html modes;

  /**
   * @param {Object} loaderContext
   */
  static init(loaderContext) {
    const { rootContext, resourcePath: templateFile, resourceQuery, hot } = loaderContext;
    const { data, esModule, mode, name: templateName, self: useSelf } = Options.get();
    const queryData = parseQuery(resourceQuery);
    let loaderMode = mode;

    if (queryData.hasOwnProperty('mode')) {
      // rule: the mode defined in query has prio over the loader option
      if (this.modes.has(queryData.mode)) {
        loaderMode = queryData.mode;
      }
      // remove mode from query data to pass in the template only clean data
      delete queryData['mode'];
    }

    this.data = merge(data || {}, queryData);

    // prevent double initialisation with same options, occurs when many entry files used in one webpack config
    if (!PluginService.isCached(rootContext)) {
      Resolver.init(loaderContext);
    }

    this.compiler = this.compilerFactory({
      loaderMode,
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
   * @param {string} loaderMode The loader mode: compile, render or html.
   * @param {string} templateFile
   * @param {string} templateName
   * @param {boolean} esModule
   * @param {boolean} useSelf Whether the `self` option is true.
   * @param {boolean} hot Whether the `hot` option of the `devServer` is enabled to page live reload.
   * @return {RenderMode}
   */
  static compilerFactory({ loaderMode, templateFile, templateName, esModule, useSelf, hot }) {
    switch (loaderMode) {
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
