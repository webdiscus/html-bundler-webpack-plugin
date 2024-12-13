const Resolver = require('../Resolver');
const { isUrl } = require('../../Common/Helpers');

/**
 * @typedef {Object} PreprocessorModeProperties
 *
 * @property{{}} preprocessor
 * @property {boolean} esModule
 * @property {boolean} hot
 * @property {Collection} collection
 */

/**
 * Base Preprocessor Mode class with abstract methods.
 */
class PreprocessorModeAbstract {
  preprocessor = null;
  collection = null;
  resolver = null;

  /**
   * @param {{}} preprocessor
   * @param {boolean} esModule
   * @param {boolean} hot
   * @param {Collection} collection
   * @param {Resolver} resolver
   */
  constructor({ preprocessor, esModule, hot, collection, resolver }) {
    this.exportCode = esModule ? 'export default ' : 'module.exports=';
    this.preprocessor = preprocessor || {};
    this.collection = collection;
    this.resolver = resolver;
    this.hot = hot === true;
  }

  /**
   * @param {string} enclosingQuotes
   * @abstract This method must be defined in the child class.
   */
  setEnclosingQuotes(enclosingQuotes) {}

  /**
   * @param {string} file
   * @return {string}
   * @abstract This method must be defined in the child class.
   */
  requireExpression(file) {}

  /**
   * Export template code with rendered HTML.
   *
   * @param {string} content The template content.
   * @param {BundlerPluginLoaderContext} loaderContext
   * @return {string}
   * @abstract This method must be defined in the child class.
   */
  export(content, loaderContext) {}

  /**
   * Export code with error message.
   *
   * @param {string|Error} error The error.
   * @param {string} issuer The issuer where the error occurred.
   * @return {string}
   * @abstract This method must be defined in the child class.
   */
  exportError(error, issuer) {}

  /**
   * Resolve resource file after compilation of source code.
   * The filename is interpolated in VM at this stage.
   *
   * @param {string} file The required file.
   * @param {string} issuer The issuer of required file.
   * @param {string|number|null} entryId The entry id where is loaded the resource.
   * @return {{requireExpression: string, resolvedFile: string}}
   */
  requireFile(file, issuer, entryId) {
    let resolvedFile = '';

    // if the source file is already resolved in a templating engine or preprocessor
    // then extract the argument of the require('/path/to/file.ext') as /path/to/file.ext
    if (file.startsWith('require(')) {
      resolvedFile = file.slice(9, -2);
    } else {
      resolvedFile = this.resolver.resolve(file, issuer);

      if (isUrl(resolvedFile)) {
        return {
          resolvedFile,
          requireExpression: resolvedFile,
        };
      }
    }

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
   * @param {string|number|null} entryId The entry id where is loaded the resource.
   * @return {{requireExpression: string, resolvedFile: string}}
   */
  requireScript(file, issuer, entryId) {
    const type = Resolver.types.script;

    let resolvedFile = '';
    if (file.startsWith('require(')) {
      resolvedFile = file.slice(9, -2);
    } else {
      resolvedFile = this.resolver.resolve(file, issuer, type);

      if (isUrl(resolvedFile)) {
        return {
          resolvedFile,
          requireExpression: resolvedFile,
        };
      }
    }

    this.collection.addResource({ type, resource: resolvedFile, issuer, entryId });

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
   * @param {string|number|null} entryId The entry id where is loaded the resource.
   * @return {{requireExpression: string, resolvedFile: string}}
   */
  requireStyle(file, issuer, entryId) {
    const type = Resolver.types.style;

    let resolvedFile = '';
    if (file.startsWith('require(')) {
      resolvedFile = file.slice(9, -2);
    } else {
      resolvedFile = this.resolver.resolve(file, issuer, type);

      if (isUrl(resolvedFile)) {
        return {
          resolvedFile,
          requireExpression: resolvedFile,
        };
      }
    }

    this.collection.addResource({ type, resource: resolvedFile, issuer, entryId });

    return {
      resolvedFile,
      requireExpression: this.requireExpression(resolvedFile),
    };
  }
}

module.exports = PreprocessorModeAbstract;
