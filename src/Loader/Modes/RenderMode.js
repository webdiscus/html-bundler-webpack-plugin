const Resolver = require('../Resolver');
const Collection = require('../../Plugin/Collection');
const { hmrFile, injectBeforeEndHead } = require('../Utils');
const { errorToHtml } = require('../Messages/Exeptions');

/**
 * Render into HTML and export a JS module.
 */
class RenderMode {
  constructor({ esModule, hot }) {
    this.hot = hot === true;
    this.exportCode = esModule ? 'export default ' : 'module.exports=';
  }

  /**
   * Decode reserved HTML chars.
   *
   * @param {string} str
   * @return {string}
   */
  decodeReservedChars(str) {
    const match = /('|\\u0026|\\u0027|\\u0060|\n|\r|\\)/g;
    const replacements = {
      '\\u0026': '&',
      '\\u0027': "'",
      '\\u0060': "\\'",
      "'": "\\'",
      '\n': '\\n',
      '\r': '\\r',
      '\\': '\\\\',
    };
    const replacer = (value) => replacements[value];

    return str.replace(match, replacer);
  }

  /**
   * @param {string} file
   * @return {string}
   */
  encodeFile(file) {
    return `\\u0027 + \\u0027${file}\\u0027 + \\u0027`;
  }

  /**
   * @param {string} file
   * @return {string}
   */
  encodeRequire(file) {
    return `\\u0027 + require(\\u0027${file}\\u0027) + \\u0027`;
  }

  /**
   * Resolve resource file after compilation of source code.
   * The filename is interpolated in VM at this stage.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @return {string}
   */
  loaderRequire(file, issuer, entryId) {
    let resolvedFile = Resolver.resolve(file, issuer);

    return this.encodeRequire(resolvedFile);
  }

  /**
   * Resolve script file after compilation of source code.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @return {string}
   */
  loaderRequireScript(file, issuer, entryId) {
    const type = 'script';
    const resolvedFile = Resolver.resolve(file, issuer, type);
    const result = this.encodeRequire(resolvedFile);

    Collection.add({ type, resource: resolvedFile, issuer, entryId });

    return result;
  }

  /**
   * Resolve style file after compilation of source code.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @return {string}
   */
  loaderRequireStyle(file, issuer, entryId) {
    const type = 'style';
    const resolvedFile = Resolver.resolve(file, issuer, type);
    const result = this.encodeRequire(resolvedFile);

    Collection.add({ type, resource: resolvedFile, issuer, entryId });

    return result;
  }

  /**
   * Inject hot update file into HTML.
   *
   * @param {string} content
   * @return {string}
   */
  injectHmrFile(content) {
    const hmrScript = `<script src="${this.encodeRequire(hmrFile)}" defer="defer"></script>`;

    return injectBeforeEndHead(content, hmrScript);
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
    if (this.hot) {
      // note: it can be tested only manually, because Webpack API no provide `loaderContext.hot` for testing
      content = this.injectHmrFile(content);
      Collection.add({ type: 'script', resource: hmrFile, issuer });
    }

    return this.exportCode + "'" + this.decodeReservedChars(content) + "';";
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
    content = this.injectHmrFile(content);
    Collection.add({ type: 'script', resource: hmrFile, issuer });

    return this.exportCode + "'" + this.decodeReservedChars(content) + "';";
  }
}

module.exports = RenderMode;
