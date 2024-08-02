const Compile = require('./Modes/Compile');
const Render = require('./Modes/Render');

class Loader {
  /** @type {Render|Compile} */
  compiler = null;

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
    const { preprocessorMode, esModule, self: useSelf } = loaderOption.get();

    this.compiler = this.factory({
      preprocessor: loaderOption.getPreprocessorModule(),
      preprocessorMode,
      esModule,
      useSelf,
      hot,
      pluginCompiler,
      collection,
      resolver,
    });
  }

  /**
   * Create instance by compilation mode.
   *
   * Note: default mode is `render`
   *
   * @param {{}} preprocessor The preprocessor option.
   * @param {string} preprocessorMode The loader mode: compile or render.
   * @param {boolean} esModule
   * @param {boolean} useSelf Whether the `self` option is true.
   * @param {boolean} hot Whether the `hot` option of the `devServer` is enabled to page live reload.
   * @param {Compiler} pluginCompiler
   * @param {Collection} collection
   * @param {Resolver} resolver
   * @return {Render|Compile}
   */
  factory({ preprocessor, preprocessorMode, esModule, useSelf, hot, pluginCompiler, collection, resolver }) {
    switch (preprocessorMode) {
      case 'compile':
        return new Compile({ preprocessor, esModule, hot, pluginCompiler, collection, resolver });
      case 'render':
      default:
        return new Render({ preprocessor, esModule, hot, pluginCompiler, collection, resolver });
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
