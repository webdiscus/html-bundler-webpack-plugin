const { unsupportedPreprocessorException } = require('./Messages/Exeptions');

/** @typedef {import('webpack').LoaderContext} LoaderContext */

class Preprocessor {
  static cache = new Map();

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
    const preprocessorDirs = {
      eta: 'Eta',
      ejs: 'Ejs',
      handlebars: 'Handlebars',
      nunjucks: 'Nunjucks',
      twig: 'Twig',
    };

    // disabled preprocessor
    if (preprocessor === false) return null;

    // default preprocessor is Eta
    if (preprocessor == null) preprocessor = 'eta';

    if (this.cache.has(preprocessor)) {
      return this.cache.get(preprocessor);
    }

    let dirname = preprocessorDirs[preprocessor];

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
   * @param {string|null|*} preprocessor The preprocessor value, should be a string
   * @param {Object} options The preprocessor options.
   * @param {boolean} watch Whether is serve/watch mode.
   * @return {Function|Promise|Object}
   */
  static factory(loaderContext, { preprocessor, options = {}, watch }) {
    const module = this.load(preprocessor);

    return module(loaderContext, options, watch);
  }

  static watchRun({ preprocessor }) {
    if (typeof preprocessor?.watch === 'function') {
      preprocessor.watch();
    }
  }
}

module.exports = Preprocessor;
