const Compile = require('./Modes/Compile');
const Render = require('./Modes/Render');

class Loader {
  /** @type {Render|Compile} */
  compiler = null;
  loaderOption = null;

  constructor() {}

  /**
   * @param {BundlerPluginLoaderContext} loaderContext
   * @param {Compiler} pluginCompiler
   * @param {Option} loaderOption The instance of the loader Option object.
   * @param {Resolver} resolver
   * @param {Collection} collection
   */
  init(loaderContext, { pluginCompiler, loaderOption, resolver, collection }) {
    const { hot } = loaderContext;

    this.loaderOption = loaderOption;
    this.compiler = this.factory({
      pluginCompiler,
      loaderOption,
      resolver,
      collection,
      hot,
    });
  }

  /**
   * Create instance by compilation mode.
   *
   * Note: default mode is `render`
   *
   * @param {Option} loaderOption The loader option instance.
   * @param {{}} preprocessor The preprocessor option.
   * @param {Compiler} pluginCompiler
   * @param {Resolver} resolver
   * @param {Collection} collection
   * @param {boolean} hot Whether the `hot` option of the `devServer` is enabled to page live reload.
   *
   * @return {Render|Compile}
   */
  factory({ pluginCompiler, loaderOption, resolver, collection, hot }) {
    const { preprocessorMode } = loaderOption.get();

    switch (preprocessorMode) {
      case 'compile':
        return new Compile({ loaderOption, pluginCompiler, collection, resolver, hot });
      case 'render':
      default:
        return new Render({ loaderOption, pluginCompiler, collection, resolver, hot });
    }
  }

  /**
   * Get loader compiler.
   *
   * @return {Render|Compile}
   */
  getCompiler() {
    return this.compiler;
  }

  /**
   * Export generated result.
   *
   * @param {string} content
   * @param {BundlerPluginLoaderContext} loaderContext
   * @return {string}
   */
  export(content, loaderContext) {
    return this.compiler.export(content, loaderContext);
  }

  /**
   * Export code with error message.
   *
   * @param {Error} error
   * @param {string} issuer The issuer where the error occurred.
   * @return {string}
   */
  exportError(error, issuer) {
    // if an error occurs before or in moment the initialisation, then return the error as the unformatted string
    return this.compiler?.exportError(error, issuer) || error.toString();
  }
}

module.exports = Loader;
