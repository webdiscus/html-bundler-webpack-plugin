const Resolver = require('../Resolver');
const Collection = require('../../Plugin/Collection');

/**
 * Abstract Preprocessor Mode class.
 */
class PreprocessorMode {
  constructor({ preprocessor, esModule, hot }) {
    this.exportCode = esModule ? 'export default ' : 'module.exports=';
    this.preprocessor = preprocessor || {};
    this.hot = hot === true;
  }

  /**
   * @param {string} enclosingQuotes
   * @abstract
   */
  setEnclosingQuotes(enclosingQuotes) {}

  /**
   * @param {string} file
   * @return {string}
   * @abstract
   */
  requireExpression(file) {
    return '';
  }

  /**
   * Export template code with rendered HTML.
   *
   * @param {string} content The template content.
   * @param {{}} data The object with variables passed in template.
   * @param {string} issuer The issuer of the template file.
   * @return {string}
   * @abstract
   */
  export(content, data, issuer) {
    return '';
  }

  /**
   * Export code with error message.
   *
   * @param {string|Error} error The error.
   * @param {string} issuer The issuer where the error occurred.
   * @return {string}
   * @abstract
   */
  exportError(error, issuer) {
    return '';
  }

  /**
   * Resolve resource file after compilation of source code.
   * The filename is interpolated in VM at this stage.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @return {{requireExpression: string, resolvedFile: string}}
   */
  requireFile(file, issuer, entryId) {
    let resolvedFile = Resolver.resolve(file, issuer);

    return {
      resolvedFile,
      requireExpression: this.requireExpression(resolvedFile),
    };
  }

  /**
   * Resolve script file after compilation of source code.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @return {{requireExpression: string, resolvedFile: string}}
   */
  requireScript(file, issuer, entryId) {
    const type = 'script';
    const resolvedFile = Resolver.resolve(file, issuer, type);

    Collection.addResource({ type, resource: resolvedFile, issuer, entryId });

    return {
      resolvedFile,
      requireExpression: this.requireExpression(resolvedFile),
    };
  }

  /**
   * Resolve style file after compilation of source code.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @return {{requireExpression: string, resolvedFile: string}}
   */
  requireStyle(file, issuer, entryId) {
    const type = 'style';
    const resolvedFile = Resolver.resolve(file, issuer, type);

    Collection.addResource({ type, resource: resolvedFile, issuer, entryId });

    return {
      resolvedFile,
      requireExpression: this.requireExpression(resolvedFile),
    };
  }
}

module.exports = PreprocessorMode;
