const { merge } = require('webpack-merge');
const { getQueryData, isWin, pathToPosix } = require('./Utils');
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
    const queryData = getQueryData(resourceQuery);

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
        return new RenderMethod({ templateFile, templateName, esModule });
      default:
        break;
    }
  }

  // /**
  //  * Resolve resource file in a tag attribute.
  //  *
  //  * @param {string} value The resource value or code included require().
  //  * @param {string} templateFile The filename of the template where resolves the resource.
  //  * @return {string}
  //  */
  // static resolveResource(value, templateFile) {
  //   const compiler = this.compiler;
  //   const openTag = 'require(';
  //   const openTagLen = openTag.length;
  //   let pos = value.indexOf(openTag);
  //
  //   if (pos < 0) return value;
  //
  //   let lastPos = 0;
  //   let result = '';
  //   let char;
  //
  //   if (isWin) templateFile = pathToPosix(templateFile);
  //
  //   // in value replace all `require` with handler name depend on a method
  //   while (~pos) {
  //     let startPos = pos + openTagLen;
  //     let endPos = startPos;
  //     let opened = 1;
  //
  //     do {
  //       char = value[++endPos];
  //       if (char === '(') opened++;
  //       else if (char === ')') opened--;
  //     } while (opened > 0 && char != null && char !== '\n' && char !== '\r');
  //
  //     if (opened > 0) {
  //       throw new Error('[loader] parse error: check the `(` bracket, it is not closed at same line:\n' + value);
  //     }
  //
  //     const file = value.slice(startPos, endPos);
  //     const replacement = compiler.require(file, templateFile);
  //
  //     result += value.slice(lastPos, pos) + replacement;
  //     lastPos = endPos + 1;
  //     pos = value.indexOf(openTag, lastPos);
  //   }
  //
  //   if (value.length - 1 > pos + openTagLen) {
  //     result += value.slice(lastPos);
  //   }
  //
  //   return result;
  // }

  /**
   * Resolve script file in the script tag.
   *
   * @param {string} value
   * @param {string} attr
   * @param {string} templateFile
   * @return {string}
   */
  static resolveResource(value, attr, templateFile) {
    const re = new RegExp(`${attr}="(.+?)"`);
    let [, file] = re.exec(value) || [];

    if (isWin) templateFile = pathToPosix(templateFile);

    const resolvedValue = this.compiler.loaderRequire(file, templateFile);

    return value.replace(file, resolvedValue);
  }

  /**
   * Resolve script file in the script tag.
   *
   * @param {string} value
   * @param {string} templateFile
   * @return {string}
   */
  static resolveScript(value, templateFile) {
    let [, file] = /src=(".+?")/.exec(value) || [];

    if (isWin) templateFile = pathToPosix(templateFile);

    return this.compiler.requireScript(file, templateFile);
  }

  /**
   * Resolve style file in the link tag.
   *
   * @param {string} value
   * @param {string} templateFile
   * @return {string}
   */
  static resolveStyle(value, templateFile) {
    let [, file] = /href="(.+?)"/.exec(value) || [];

    if (isWin) templateFile = pathToPosix(templateFile);

    const resolvedValue = this.compiler.loaderRequireStyle(file, templateFile);

    return value.replace(file, resolvedValue);
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
