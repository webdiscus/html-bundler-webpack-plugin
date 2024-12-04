/**
 * The plugin services for common usage.
 * The instance is available both in the plugin and loader.
 */

const path = require('path');
const WeakMapIterable = require('../Common/WeakMapIterable');
const Preprocessor = require('../Loader/Preprocessor');

class PluginService {
  /**
   * @type {AssetCompiler}
   */
  static plugin = null;

  static #contexts = new WeakMapIterable();

  /**
   * Set use state of the plugin.
   *
   * If the plugin is used, then this method will be called by the plugin initialization
   * to disable some features of the plugin, because never used with the plugin,
   * but require additional compilation time.
   *
   * @param {Compiler} compiler The webpack compiler.
   * @param {Object} pluginContext
   * @param {AssetCompiler} plugin
   */
  static init(compiler, pluginContext, plugin) {
    let context = this.#contexts.get(compiler);

    if (!context) {
      const pluginOptions = pluginContext.pluginOption.get();

      // options defined in the plugin but provided to the loader
      const loaderOptions = pluginOptions.loaderOptions || {};

      // add reference for data to the loader options
      if (pluginOptions.data && !loaderOptions.data) {
        loaderOptions.data = pluginOptions.data;
      }

      // add reference for beforePreprocessor to the loader options
      if (pluginOptions.beforePreprocessor != null && loaderOptions.beforePreprocessor == null) {
        loaderOptions.beforePreprocessor = pluginOptions.beforePreprocessor;
      }

      // add reference for the preprocessor option into the loader options
      if (pluginOptions.preprocessor != null && loaderOptions.preprocessor == null) {
        loaderOptions.preprocessor = pluginOptions.preprocessor;

        if (pluginOptions.preprocessorOptions && !loaderOptions.preprocessorOptions) {
          loaderOptions.preprocessorOptions = pluginOptions.preprocessorOptions;
        }
      }

      context = {
        pluginContext,
        loaderOptions,
        loaderOption: null,
        // cached loader options
        loaderCache: new Map(),
        contextCache: new Set(),
        dataFiles: new Map(),
        // loader dependency is injected instances
        dependency: null,
        hotUpdate: pluginOptions.hotUpdate,
      };

      this.#contexts.set(compiler, context);
    }

    context.used = true;
    context.watchMode = false;
    context.loaderCache.clear();

    this.plugin = plugin;
  }

  /**
   * Get this context by webpack compiler.
   *
   * @param {Compiler} compiler The webpack compiler is the context key of the plugin context.
   */
  static getContext(compiler) {
    return this.#contexts.get(compiler);
  }

  /**
   * Get plugin context by webpack compiler.
   *
   * @param {Compiler} compiler The webpack compiler is the context key of the plugin context.
   */
  static getPluginContext(compiler) {
    return this.getContext(compiler)?.pluginContext;
  }

  static getLoaderOption(compiler) {
    return this.getContext(compiler)?.loaderOption;
  }

  static setLoaderOption(compiler, loaderOption) {
    this.getContext(compiler).loaderOption = loaderOption;
  }

  static getLoaderDependency(compiler) {
    return this.getContext(compiler)?.dependency;
  }

  /**
   * Whether the plugin is defined in Webpack configuration.
   *
   * @param {Compiler} compiler The webpack compiler.
   * @return {boolean}
   */
  static isUsed(compiler) {
    return this.getContext(compiler)?.used === true;
  }

  /**
   * @param {Compiler} compiler The webpack compiler.
   * @return {boolean}
   */
  static isWatchMode(compiler) {
    return this.getContext(compiler).watchMode;
  }

  /**
   * @param {Compiler} compiler The webpack compiler.
   * @param {string} context
   * @return {boolean}
   */
  static isCached(compiler, context) {
    if (this.getContext(compiler).contextCache.has(context)) return true;
    this.getContext(compiler).contextCache.add(context);

    return false;
  }

  /**
   * @param {Compiler} compiler The webpack compiler.
   * @return {boolean}
   */
  static useHotUpdate(compiler) {
    return this.getContext(compiler).hotUpdate;
  }

  /**
   * Resolve relative file path.
   *
   * @param {Compiler} compiler
   * @param {string} file
   * @return {string}
   */
  static resolveFile(compiler, file) {
    const context = compiler.options.context;

    return path.isAbsolute(file) ? file : path.join(context, file);
  }

  /**
   * @param {Compiler} compiler The webpack compiler.
   * @param {Dependency} dependency
   */
  static setDependencyInstance(compiler, dependency) {
    this.getContext(compiler).dependency = dependency;
  }

  /**
   * @param {Compiler} compiler The webpack compiler.
   * @returns {HtmlBundlerPlugin.Hooks} The plugin hooks.
   */
  static getHooks(compiler) {
    const compilation = this.getCompilation(compiler);
    return this.plugin.getHooks(compilation);
  }

  /**
   * @param {Compiler} compiler The webpack compiler.
   * @return {Compilation} The webpack compilation instance of the plugin compiler.
   */
  static getCompilation(compiler) {
    return this.getPluginContext(compiler).compilation;
  }

  /**
   * Returns plugin options instance.
   *
   * TODO: rename to getPluginOptionInstance()
   *
   * @param {Compiler} compiler The webpack compiler.
   * @return {OptionPluginInterface}
   */
  static getOptions(compiler) {
    return this.getPluginContext(compiler).pluginOption;
  }

  /**
   * Returns options defined in the plugin but provided for the loader.
   *
   * @param {Compiler} compiler The webpack compiler.
   * @return {Object}
   */
  static getLoaderOptions(compiler) {
    return this.getContext(compiler).loaderOptions;
  }

  /**
   * Get cached loader options defined in rules.
   *
   * @param {Compiler} compiler The webpack compiler.
   * @param {string} id
   * @return {Object}
   */
  static getLoaderCache(compiler, id) {
    return this.getContext(compiler).loaderCache.get(id);
  }

  /**
   * Save initialized loader options in cache to avoid double initialization
   * when many templates loaded with same loader options.
   *
   * @param {Compiler} compiler The webpack compiler.
   * @param {string} id
   * @param {Object} cache
   */
  static setLoaderCache(compiler, id, cache) {
    this.getContext(compiler).loaderCache.set(id, cache);
  }

  static getDataFiles(compiler, key) {
    return this.getContext(compiler).dataFiles.get(key);
  }

  static getValuesOfDataFiles(compiler) {
    return this.getContext(compiler).dataFiles.values();
  }

  static setDataFiles(compiler, key, value) {
    this.getContext(compiler).dataFiles.set(key, value);
  }

  /**
   * @param {Compiler} compiler The webpack compiler.
   * @param {boolean} mode The mode is true when Webpack run as watch/serve.
   */
  static setWatchMode(compiler, mode) {
    this.getContext(compiler).watchMode = mode;
  }

  /**
   * Called before each new compilation, in the serve/watch mode.
   *
   * @param {Compiler} compiler The webpack compiler.
   */
  static watchRun(compiler) {
    const loaderOption = this.getLoaderOption(compiler);
    const preprocessorModule = loaderOption?.getPreprocessorModule();

    Preprocessor.watchRun(preprocessorModule);
  }

  /**
   * Called after by shutdown and watchClose.
   * Used for tests to reset data after each test case.
   *
   * @param {Compiler|null} compiler
   */
  static shutdown(compiler) {
    if (!compiler) {
      // if there was an error in the code earlier, then compiler is undefined
      return;
    }

    const context = this.getContext(compiler);

    if (!context) {
      // when was already called the context was removed
      return;
    }

    context.used = false;
    context.loaderCache.clear();
    context.contextCache.clear();
    context.dataFiles.clear();
    context.dependency?.shutdown();

    const loaderOption = this.getLoaderOption(compiler);
    const preprocessorModule = loaderOption?.getPreprocessorModule();
    Preprocessor.shutdown(preprocessorModule);

    this.#contexts.delete(compiler);
  }
}

module.exports = PluginService;
