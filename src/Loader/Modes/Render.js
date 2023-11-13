const PreprocessorMode = require('./PreprocessorMode');
const Collection = require('../../Plugin/Collection');
const PluginService = require('../../Plugin/PluginService');
const { hotUpdateFile, injectBeforeEndHead, decodeReservedChars } = require('../Utils');
const { errorToHtml } = require('../Messages/Exeptions');

/**
 * Render into HTML and export as a JS module.
 */
class Render extends PreprocessorMode {
  constructor(options) {
    super(options);
  }

  /**
   * @param {string} enclosingQuotes
   */
  setEnclosingQuotes(enclosingQuotes) {
    // do nothing, this method used by the `compile` mode only
  }

  /**
   * @param {string} file
   * @return {string}
   */
  requireExpression(file) {
    return `\\u0027 + require(\\u0027${file}\\u0027) + \\u0027`;
  }

  /**
   * Inject hot update file into HTML.
   *
   * @param {string} content
   * @return {string}
   */
  injectHotScript(content) {
    const hotScript = `<script src="${this.requireExpression(hotUpdateFile)}" defer="defer"></script>`;

    return injectBeforeEndHead(content, hotScript);
  }

  /**
   * Export template code with rendered HTML.
   *
   * @param {string} content The template content.
   * @param {{}} data The object with variables passed in template.
   * @param {string} issuer
   * @return {string}
   */
  export(content, data, issuer) {
    /* istanbul ignore next: Webpack API no provide `loaderContext.hot` for testing */
    if (this.hot && PluginService.useHotUpdate()) {
      content = this.injectHotScript(content);
      Collection.addResource({ type: 'script', resource: hotUpdateFile, issuer });
    }

    return this.exportCode + "'" + decodeReservedChars(content) + "';";
  }

  /**
   * Export code with error message.
   *
   * @param {string|Error} error The error.
   * @param {string} issuer The issuer where the error occurred.
   * @return {string}
   */
  exportError(error, issuer) {
    let content = errorToHtml(error);

    if (PluginService.useHotUpdate()) {
      content = this.injectHotScript(content);
      Collection.addResource({ type: 'script', resource: hotUpdateFile, issuer });
    }

    return this.exportCode + "'" + decodeReservedChars(content) + "';";
  }
}

module.exports = Render;
