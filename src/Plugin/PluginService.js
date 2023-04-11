/**
 * The plugin services for common usage.
 * The instance available both in the plugin and loader.
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

  /**
   * Set use state of the plugin.
   *
   * If the plugin is used, then this method will be called by the plugin initialisation
   * to disable some features of the plugin, because never used with the plugin,
   * but require additional compilation time.
   *
   * @param {PluginOptionInstance} options The plugin options instance.
   */
  static init(options) {
    this.#used = true;
    this.#watchMode = false;
    this.#options = options;
    this.#loaderOptions = options.get().loaderOptions || {};
    this.#loaderCache.clear();
  }

  /**
   * @param {boolean} mode The mode is true when Webpack run as watch/serve.
   */
  static setWatchMode(mode) {
    this.#watchMode = mode;
  }

  /**
   * Called before each new compilation, in the serv/watch mode.
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
   * Returns options defined in plugin but provided for the loader.
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
   * Save initialized loader options in cache to avoid double initialisation
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
   * Called when the compiler is closing.
   * Used for tests to reset data after each test case.
   */
  static shutdown() {
    this.#used = false;
    this.#contextCache.clear();
  }
}

module.exports = PluginService;
