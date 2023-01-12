const VMScript = require('../VMScript');
const Resolver = require('../Resolver');
const { scriptStore } = require('../Modules');
const { isRequireableScript, hmrFile } = require('../Utils');

/**
 * Render into HTML and export a JS module.
 */
class RenderMethod {
  constructor({ templateFile, templateName, esModule }) {
    const loaderRequire = this.loaderRequire.bind(this);
    const loaderRequireScript = this.loaderRequireScript.bind(this);
    const loaderRequireStyle = this.loaderRequireStyle.bind(this);

    this.templateFile = templateFile;
    this.exportCode = esModule ? 'export default ' : 'module.exports=';
    this.vmscript = new VMScript({
      templateName,
      loaderRequire,
      loaderRequireScript,
      loaderRequireStyle,
    });
  }

  /**
   * Encode reserved HTML chars.
   *
   * @param {string} str
   * @return {string}
   */
  encodeReservedChars(str) {
    if (str.indexOf('?') < 0) return str;

    const match = /[&'"]/g;
    const replacements = { '&': '\\u0026', "'": '\\u0060', '"': '\\u0060' };
    const replacer = (value) => replacements[value];

    return str.replace(match, replacer);
  }

  /**
   * Decode reserved HTML chars.
   *
   * @param {string} str
   * @return {string}
   */
  decodeReservedChars(str) {
    const match = /('|\\u0026|\\u0027|\\u0060|\n)/g;
    // noinspection JSAnnotator (disable JetBrains inspector)
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

    //resolvedFile = this.encodeReservedChars(resolvedFile);

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
    scriptStore.add(resolvedFile);

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
   * Returns the expression with the name of the handler function in the template source code,
   * which will be called when this template is compiled in the VM.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @return {string}
   */
  require(file, issuer) {
    return this.vmscript.require(file, issuer);
  }

  /**
   * Returns the expression with the name of the handler function in the template source code,
   * which will be called when this template is compiled in the VM.
   * The filename from the script tag will be stored for usage in the plugin.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @return {string}
   */
  requireScript(file, issuer) {
    return this.vmscript.require(file, issuer, 'script');
  }

  /**
   * Returns the expression with the name of the handler function in the template source code,
   * which will be called when this template is compiled in the VM.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @return {string}
   */
  requireStyle(file, issuer) {
    return this.vmscript.require(file, issuer, 'style');
  }

  /**
   * Export template code with rendered HTML.
   *
   * @param {string} source The template source code.
   * @param {{}} locals The variables passed in template function.
   * @return {string}
   */
  export(source, locals) {
    //const result = this.vmscript.run(this.templateFile, source, locals);

    //return this.exportCode + "'" + this.decodeReservedChars(result) + "';";
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
    scriptStore.add(hmrFile);

    return this.exportCode + "'" + message + "';";
  }
}

module.exports = RenderMethod;
