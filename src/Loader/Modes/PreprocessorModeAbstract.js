const Resolver = require('../Resolver');
const { isUrl } = require('../../Common/Helpers');

/**
 * @typedef {Object} PreprocessorModeProperties
 *
 * @property {Option} loaderOption The loader option instance.
 * @property {Compiler} pluginCompiler
 * @property {Collection} collection
 * @property {Resolver} resolver
 * @property {boolean} hot
 */

/**
 * Base Preprocessor Mode class with abstract methods.
 */
class PreprocessorModeAbstract {
  pluginCompiler = null;
  loaderOption = null;
  preprocessor = null;
  collection = null;
  resolver = null;
  exportCode = '';

  /**
   * @param {Option} loaderOption The loader option instance.
   * @param {Collection} collection
   * @param {Compiler} pluginCompiler
   * @param {Resolver} resolver
   * @param {boolean} hot
   */
  constructor({ loaderOption, pluginCompiler, collection, resolver, hot }) {
    const preprocessor = loaderOption.getPreprocessorModule();
    const { esModule } = loaderOption.get();

    //console.log('collection: ', collection);

    this.exportCode = esModule ? 'export default ' : 'module.exports=';
    this.preprocessor = preprocessor || {};
    this.loaderOption = loaderOption;
    this.pluginCompiler = pluginCompiler;
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
   * @return {{requireExpression: string, resolvedFile: string} | false}
   */
  requireFile(file, issuer, entryId) {
    let resolvedFile = '';

    // if the source file is already resolved in a templating engine or preprocessor
    // then extract the argument of the require('/path/to/file.ext') as /path/to/file.ext
    if (file.startsWith('require(')) {
      resolvedFile = file.slice(9, -2);
    } else {
      resolvedFile = this.resolver.resolve(file, issuer);

      let isEntryFile = this.loaderOption.isEntry(resolvedFile);
      let isRouteFile = this.loaderOption.isRoute(resolvedFile);
      let isRequestUrl = isUrl(resolvedFile);

      if (isRouteFile) {
        if (!this.loaderOption.isRouterEnabled()) {
          return false;
        }

        if (!isRequestUrl) {
          this.collection.saveInnerRoute(resolvedFile, issuer);
        }
      }

      if (isEntryFile || isRouteFile || isRequestUrl) {
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
