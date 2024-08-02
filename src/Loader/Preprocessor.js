const path = require('path');
const { unsupportedPreprocessorException } = require('./Messages/Exeptions');

/** @typedef {import('webpack').LoaderContext} LoaderContext */

class Preprocessor {
  static dir = 'Preprocessors';

  static moduleDirs = {
    eta: 'Eta',
    ejs: 'Ejs',
    handlebars: 'Handlebars',
    nunjucks: 'Nunjucks',
    twig: 'Twig',
    pug: 'Pug',
  };

  /**
   * The cache of already loaded preprocessor modules.
   * @type {Map<string, any>}
   */
  static cache = new Map();

  /**
   * @param {BundlerPluginLoaderContext} loaderContext The loader context of Webpack.
   * @param {Object} loaderOption The loader instance.
   */
  static init(loaderContext, loaderOption) {
    if (!loaderOption.isPreprocessorEnabled() || loaderOption.hasPreprocessor()) return;

    const options = loaderOption.get();
    let module;

    if (typeof options.preprocessor === 'function') {
      // default structure of the created preprocessor module
      module = {
        id: 'userPreprocessor',
        render: options.preprocessor,
        compile: options.preprocessor,
      };
    } else {
      module = Preprocessor.factory(loaderContext, options, loaderOption.isWatchMode());
    }

    loaderOption.setPreprocessorModule(module);
  }

  /**
   * Factory preprocessor as a function.
   *
   * @param {BundlerPluginLoaderContext} loaderContext The loader context of Webpack.
   * @param {Object} options The loader options.
   * @param {boolean} watch Whether is serve/watch mode.
   * @return {Function|Promise|Object}
   */
  static factory(loaderContext, options = {}, watch) {
    const { preprocessor, preprocessorOptions, esModule } = options;
    const module = this.load(preprocessor);

    return module(loaderContext, preprocessorOptions || {}, { esModule, watch });
  }

  /**
   * Load preprocessor module.
   * The default preprocessor uses the Eta template engine.
   *
   * @param {string|function|boolean|undefined} preprocessor
   * @return {*} TODO: add jsdoc for the preprocessor module type
   * @throws
   */
  static load(preprocessor) {
    // disabled preprocessor
    if (preprocessor === false) return null;

    // default preprocessor is Eta
    if (preprocessor == null) preprocessor = 'eta';

    if (this.cache.has(preprocessor)) {
      return this.cache.get(preprocessor);
    }

    let moduleDir = this.moduleDirs[preprocessor];

    if (moduleDir) {
      // we are sure the `index.js` file exists in the module directory
      const modulePath = path.join(__dirname, this.dir, moduleDir, 'index.js');
      const module = require(modulePath);

      this.cache.set(preprocessor, module);

      return module;
    }

    unsupportedPreprocessorException(preprocessor);
  }

  /**
   * @param {*} preprocessor
   * @return {RegExp|null}
   */
  static getTest(preprocessor) {
    const module = typeof preprocessor === 'function' ? preprocessor : this.load(preprocessor);

    return module?.test;
  }

  /**
   * Run watch method in the preprocessor module.
   * Called after changes in watch/serve mode.
   *
   * TODO: add type of the preprocessorModule
   *
   * @param {Object} preprocessorModule
   */
  static watchRun(preprocessorModule) {
    if (typeof preprocessorModule?.watch === 'function') {
      preprocessorModule.watch();
    }
  }
}

module.exports = Preprocessor;
