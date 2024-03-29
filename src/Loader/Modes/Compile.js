const PreprocessorMode = require('./PreprocessorMode');
const { errorToHtml } = require('../Messages/Exeptions');
const { decodeReservedChars, escapeSequences } = require('../Utils');
const { isWin, pathToPosix } = require('../../Common/Helpers');

/**
 * Compile into JS function and export as a JS module.
 */
class Compile extends PreprocessorMode {
  enclosingQuotes = `'`;
  isExport = false;

  constructor({ preprocessor, esModule, hot }) {
    super({ preprocessor, esModule, hot });
    this.isExport = typeof preprocessor.export === 'function';
  }

  /**
   * @param {string} enclosingQuotes
   */
  setEnclosingQuotes(enclosingQuotes) {
    this.enclosingQuotes = enclosingQuotes;
  }

  /**
   * @param {string} file
   * @return {string}
   */
  requireExpression(file) {
    const quote = this.enclosingQuotes;

    if (isWin) file = pathToPosix(file);

    return `${quote} + require('${file}') + ${quote}`;
  }

  /**
   * Export a template function depending on the code generated by the preprocessor.
   *
   * @param {string} content The source of template function.
   * @param {BundlerPluginLoaderContext} loaderContext
   * @return {string}
   */
  export(content, loaderContext) {
    return this.isExport ? this.preprocessor.export(content, loaderContext) : content;
  }

  /**
   * Export code with error message.
   *
   * @param {string|Error} error The error.
   * @param {string} issuer The issuer where the error occurred.
   * @return {string}
   */
  exportError(error, issuer) {
    const content = errorToHtml(error);

    return this.exportCode + "'" + decodeReservedChars(content) + "';";
  }
}

module.exports = Compile;
