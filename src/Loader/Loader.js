const { merge } = require('webpack-merge');
const PluginService = require('../Plugin/PluginService');
const Resolver = require('./Resolver');
const RenderMethod = require('./methods/RenderMethod');
const Options = require('./Options');
const { parseQuery } = require('./Utils');

class Loader {
  static compiler = null;
  static methods = [
    {
      method: 'render',
      query: 'method-render',
    },
  ];

  /**
   * @param {Object} loaderContext
   */
  static init(loaderContext) {
    const { rootContext, resourcePath: templateFile, resourceQuery } = loaderContext;
    const { data, esModule, method, name: templateName, self: useSelf } = Options.get();

    // the rule: a query method override a global method defined in the loader options
    const queryData = parseQuery(resourceQuery);

    // prevent double initialisation with same options, occurs when many entry files used in one webpack config
    if (!PluginService.isCached(rootContext)) {
      Resolver.init(rootContext);
    }

    this.compiler = this.compilerFactory({
      method,
      templateFile,
      templateName,
      queryData,
      esModule,
      useSelf,
    });

    // remove method from query data to pass in the template only clean data
    const query = this.compiler.query;
    if (queryData.hasOwnProperty(query)) {
      delete queryData[query];
    }

    this.data = merge(data || {}, queryData);
  }

  /**
   * Create instance by compilation method.
   *
   * Note: default method is `render`
   *
   * @param {string} method
   * @param {string} templateFile
   * @param {string} templateName
   * @param {Object} queryData
   * @param {boolean} esModule
   * @param {boolean} useSelf Whether the `self` option is true.
   * @return {RenderMethod}
   */
  static compilerFactory({ method, templateFile, templateName, queryData, esModule, useSelf }) {
    const methodFromQuery = this.methods.find((item) => queryData.hasOwnProperty(item.query));
    const methodFromOptions = this.methods.find((item) => method === item.method);

    // default method
    let methodName = 'render';
    if (methodFromQuery) {
      methodName = methodFromQuery.method;
    } else if (methodFromOptions) {
      methodName = methodFromOptions.method;
    }

    switch (methodName) {
      case 'render':
      default:
        return new RenderMethod({ templateFile, templateName, esModule });
    }
  }

  /**
   * Export generated result.
   *
   * @param {string} source
   * @return {string}
   */
  static export(source) {
    return this.compiler.export(source, this.data);
  }

  /**
   * Export code with error message.
   *
   * @param {string} message
   * @param {string} issuer The issuer where the error occurred.
   * @return {string}
   */
  static exportError(message, issuer) {
    return this.compiler.exportError(message, issuer);
  }
}

module.exports = Loader;
