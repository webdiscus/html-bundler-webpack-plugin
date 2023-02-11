const Resolver = require('../Resolver');
const ScriptCollection = require('../../Plugin/ScriptCollection');
const { hmrFile } = require('../Utils');

/**
 * Render into HTML and export a JS module.
 */
class RenderMethod {
  constructor({ templateFile, templateName, esModule }) {
    this.templateFile = templateFile;
    this.exportCode = esModule ? 'export default ' : 'module.exports=';
  }

  /**
   * Decode reserved HTML chars.
   *
   * @param {string} str
   * @return {string}
   */
  decodeReservedChars(str) {
    const match = /('|\\u0026|\\u0027|\\u0060|\n)/g;
    const replacements = { '\\u0026': '&', '\\u0027': "'", '\\u0060': "\\'", "'": "\\'", '\n': '\\n' };
    const replacer = (value) => replacements[value];

    return str.replace(match, replacer);
  }

  /**
   * Resolve resource file after compilation of source code.
   * At this stage the filename is interpolated in VM.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @return {string}
   */
  loaderRequire(file, issuer) {
    let resolvedFile = Resolver.resolve(file, issuer);

    return `\\u0027 + require(\\u0027${resolvedFile}\\u0027) + \\u0027`;
  }

  /**
   * Resolve script file after compilation of source code.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @return {string}
   */
  loaderRequireScript(file, issuer) {
    const resolvedFile = Resolver.resolve(file, issuer, 'script');

    ScriptCollection.add(resolvedFile);

    return `\\u0027 + require(\\u0027${resolvedFile}\\u0027) + \\u0027`;
  }

  /**
   * Resolve style file after compilation of source code.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @return {string}
   */
  loaderRequireStyle(file, issuer) {
    const resolvedFile = Resolver.resolve(file, issuer, 'style');

    return `\\u0027 + require(\\u0027${resolvedFile}\\u0027) + \\u0027`;
  }

  /**
   * Export template code with rendered HTML.
   *
   * @param {string} source The template source code.
   * @param {{}} locals The variables passed in template function.
   * @return {string}
   */
  export(source, locals) {
    return this.exportCode + "'" + this.decodeReservedChars(source) + "';";
  }

  /**
   * Export code with error message.
   *
   * @param {Error} error
   * @param {Function} getErrorMessage
   * @return {string}
   */
  exportError(error, getErrorMessage) {
    const requireHmrScript = `' + require('${hmrFile}') + '`;
    const errStr = error.toString().replace(/'/g, "\\'");
    const message = getErrorMessage.call(null, errStr, requireHmrScript);

    ScriptCollection.add(hmrFile);

    return this.exportCode + "'" + message + "';";
  }
}

module.exports = RenderMethod;
