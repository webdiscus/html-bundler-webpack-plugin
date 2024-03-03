const path = require('path');

class Config {
  static #loaded = false;
  static #configFile = '';
  static #config = {
    // plugin name, must be same as node module name
    pluginName: 'webpack-plugin',
    // label in terminal output from plugin
    pluginLabel: 'plugin',
    // label in terminal output from loader
    loaderLabel: 'loader',
  };

  static init(file) {
    this.#configFile = path.isAbsolute(file)
      ? require.resolve(file)
      : // path relative to `./src/Common`
        require.resolve(path.join('../', file));
  }

  static get() {
    // lazy load config data
    if (!this.#loaded) {
      this.#load();
    }

    return this.#config;
  }

  static #load() {
    if (this.#configFile) {
      let config = require(this.#configFile);
      this.#config = Object.assign(this.#config, config);
      this.#loaded = true;
    }
  }
}

module.exports = Config;
