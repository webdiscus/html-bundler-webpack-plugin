const PreprocessorModeAbstract = require('./PreprocessorModeAbstract');
const PluginService = require('../../Plugin/PluginService');
const { hotUpdateFile, injectBeforeEndHead, decodeReservedChars } = require('../Utils');
const { errorToHtml } = require('../Messages/Exeptions');

/**
 * Render into HTML and export as a JS module.
 */
class Render extends PreprocessorModeAbstract {
  /**
   * @param {PreprocessorModeProperties} props
   */
  constructor(props) {
    super(props);
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
   * @param {BundlerPluginLoaderContext} loaderContext
   * @return {string}
   */
  export(content, loaderContext) {
    const { resource: issuer } = loaderContext;
    // Webpack API no provide `loaderContext.hot` for testing, therefore we use the ENV property to detect testing
    const isHotUpdate = this.hot || 'NODE_ENV_TEST' in process.env;

    if (isHotUpdate && PluginService.useHotUpdate(this.pluginCompiler)) {
      content = this.injectHotScript(content);
      this.collection.addResource({ type: 'script', resource: hotUpdateFile, issuer });
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

    if (PluginService.useHotUpdate(this.pluginCompiler)) {
      content = this.injectHotScript(content);
      this.collection.addResource({ type: 'script', resource: hotUpdateFile, issuer });
    }

    return this.exportCode + "'" + decodeReservedChars(content) + "';";
  }
}

module.exports = Render;
