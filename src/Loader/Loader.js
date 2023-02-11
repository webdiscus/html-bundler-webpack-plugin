const { merge } = require('webpack-merge');
const { isWin, parseQuery, pathToPosix } = require('./Utils');
const RenderMethod = require('./methods/RenderMethod');

class Loader {
  static compiler = null;
  static methods = [
    {
      method: 'render',
      query: 'method-render',
    },
  ];

  /**
   * @param {string} filename The template file.
   * @param {string} resourceQuery The URL query of template.
   * @param {{}} options The loader options.
   * @param {{}} customData The custom data.
   */
  static init({ filename: templateFile, resourceQuery, options, customData }) {
    const { data, esModule, method, name: templateName, self: useSelf } = options;

    // the rule: a query method override a global method defined in the loader options
    const queryData = parseQuery(resourceQuery);

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

    this.data = merge(data || {}, customData || {}, queryData);
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
   * @param {Error} error
   * @param {Function} getErrorMessage
   * @return {string}
   */
  static exportError(error, getErrorMessage) {
    return this.compiler.exportError(error, getErrorMessage);
  }
}

module.exports = Loader;
