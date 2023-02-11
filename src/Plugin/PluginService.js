/**
 * The plugin services for common usage.
 * The instance available both in the plugin and loader.
 */
class PluginService {
  static used = false;
  static options = null;
  static contextCache = new Set();

  /**
   * Set use state of the plugin.
   *
   * If the plugin is used, then this method will be called by the plugin initialisation
   * to disable some features of the plugin, because never used with the plugin,
   * but require additional compilation time.
   *
   * @param {{}} options The options of the plugin.
   */
  static init(options) {
    this.used = true;
    this.options = options;
  }

  /**
   * Return a list of resolve restrictions to restrict the paths that a request can be resolved on.
   * @see https://webpack.js.org/configuration/resolve/#resolverestrictions
   * @return {Array<RegExp|string>}
   */
  static getStyleRestrictions() {
    return this.options ? [this.options.extractCss?.test] : [];
  }

  /**
   * Whether is the plugin used.
   * @return {boolean}
   */
  static isUsed() {
    return this.used;
  }

  static isCached(context) {
    if (this.contextCache.has(context)) return true;
    this.contextCache.add(context);

    return false;
  }

  /**
   * Reset states.
   * Used for tests to reset state after each test case.
   */
  static reset() {
    this.used = false;
    this.contextCache.clear();
  }
}

module.exports = PluginService;
