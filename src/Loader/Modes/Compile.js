const PreprocessorMode = require('./PreprocessorMode');
const { errorToHtml } = require('../Messages/Exeptions');
const { decodeReservedChars, escapeSequences } = require('../Utils');

/**
 * Compile into JS function and export as a JS module.
 */
class Compile extends PreprocessorMode {
  enclosingQuotes = `'`;

  constructor({ preprocessor, esModule, hot }) {
    super({ preprocessor, esModule, hot });

    this.preprocessorExport =
      typeof preprocessor.export === 'function'
        ? preprocessor.export
        : (content) => `const templateFn = () => '` + escapeSequences(content) + `';${this.exportCode}templateFn;`;
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

    return `${quote} + require('${file}') + ${quote}`;
  }

  /**
   * Export template function.
   *
   * @param {string} content The source of template function.
   * @param {{}} data The object with variables passed in template.
   * @param {string} issuer
   * @return {string}
   */
  export(content, data, issuer) {
    return this.preprocessorExport(content);
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
