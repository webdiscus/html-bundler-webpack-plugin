const { unsupportedPreprocessorException } = require('./Messages/Exeptions');

/** @typedef {import('webpack').LoaderContext} LoaderContext */

class Preprocessor {
  static cache = new Map();

  static dirs = {
    eta: 'Eta',
    ejs: 'Ejs',
    handlebars: 'Handlebars',
    nunjucks: 'Nunjucks',
    twig: 'Twig',
    pug: 'Pug',
  };

  /**
   * Whether the preprocessor is used.
   *
   * @param {*} preprocessor
   * @return {boolean}
   */
  static isUsed(preprocessor) {
    // disabled preprocessor
    if (preprocessor === false) return true;
    return typeof (preprocessor?.render || preprocessor?.compile || preprocessor) === 'function';
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

    let dirname = this.dirs[preprocessor];

    if (dirname) {
      // we are sure the file exists
      const module = require(`./Preprocessors/${dirname}/index.js`);
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
   * Returns a preprocessor method to render/compile a template.
   *
   * @param {Object} options The loader options.
   * @return {null|(function(string, loaderContext: BundlerPluginLoaderContext): Promise|null)}
   */
  static getPreprocessor(options) {
    const { preprocessor, preprocessorMode } = options;

    if (typeof preprocessor === 'function') return preprocessor;

    // render/compile
    const modeFn = preprocessor[preprocessorMode];
    if (typeof modeFn === 'function') return modeFn;

    return null;
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

  static watchRun({ preprocessor }) {
    if (typeof preprocessor?.watch === 'function') {
      preprocessor.watch();
    }
  }
}

module.exports = Preprocessor;
