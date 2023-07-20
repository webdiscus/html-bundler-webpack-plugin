/**
 * The plugin services for common usage.
 * The instance is available both in the plugin and loader.
 */

const Preprocessor = require('../Loader/Preprocessor');

/** @typedef {import('Options')} PluginOptionInstance */

class PluginService {
  /** @type PluginOptionInstance Provide to use the plugin option instance in the loader. */
  static #options = {};

  // options defined in the plugin but provided to the loader
  static #loaderOptions = {};

  // cached loader options
  static #loaderCache = new Map();
  static #used = false;
  static #watchMode = false;
  static #contextCache = new Set();
  static dataFiles = new Map();

  // dependency injected instances
  static Dependency = null;

  // entry files where js file was not resolved,
  // used to try to rebuild the entry module when a missing js file is added or renamed to the required name
  static missingFiles = new Set();

  /**
   * Set use state of the plugin.
   *
   * If the plugin is used, then this method will be called by the plugin initialization
   * to disable some features of the plugin, because never used with the plugin,
   * but require additional compilation time.
   *
   * @param {Options} options The plugin options instance.
   */
  static init(options) {
    const pluginOptions = options.get();
    const loaderOptions = pluginOptions.loaderOptions || {};

    // add the preprocessor option into the loader option
    if (pluginOptions.preprocessor) {
      loaderOptions.preprocessor = pluginOptions.preprocessor;

      if (pluginOptions.preprocessorOptions) {
        loaderOptions.preprocessorOptions = pluginOptions.preprocessorOptions;
      }
    }

    this.#used = true;
    this.#watchMode = false;
    this.#options = options;
    this.#loaderOptions = loaderOptions;
    this.#loaderCache.clear();
  }

  static setDependencyInstance(Dependency) {
    this.Dependency = Dependency;
  }

  /**
   * @param {boolean} mode The mode is true when Webpack run as watch/serve.
   */
  static setWatchMode(mode) {
    this.#watchMode = mode;
  }

  /**
   * Called before each new compilation, in the serve/watch mode.
   */
  static watchRun() {
    for (const [id, options] of this.#loaderCache) {
      Preprocessor.watchRun(options);
    }
  }

  /**
   * Returns plugin options instance.
   *
   * @return {PluginOptionInstance}
   */
  static getOptions() {
    return this.#options;
  }

  /**
   * Returns options defined in the plugin but provided for the loader.
   *
   * @return {Object}
   */
  static getLoaderOptions() {
    return this.#loaderOptions;
  }

  /**
   * Get cached loader options defined in rules.
   *
   * @param {string} id
   * @return {Object}
   */
  static getLoaderCache(id) {
    return this.#loaderCache.get(id);
  }

  /**
   * Save initialized loader options in cache to avoid double initialization
   * when many templates loaded with same loader options.
   *
   * @param {string} id
   * @param {Object} cache
   */
  static setLoaderCache(id, cache) {
    this.#loaderCache.set(id, cache);
  }

  /**
   * Whether the plugin is defined in Webpack configuration.
   * @return {boolean}
   */
  static isUsed() {
    return this.#used;
  }

  static isWatchMode() {
    return this.#watchMode;
  }

  static isCached(context) {
    if (this.#contextCache.has(context)) return true;
    this.#contextCache.add(context);

    return false;
  }

  /**
   * Reset settings.
   * Called before each new compilation after changes, in the serve/watch mode.
   */
  static reset() {}

  /**
   * Called when the compiler is closing.
   * Used for tests to reset data after each test case.
   */
  static shutdown() {
    this.#used = false;
    this.#contextCache.clear();
    this.dataFiles.clear();
    this.Dependency && this.Dependency.shutdown();
  }
}

module.exports = PluginService;
