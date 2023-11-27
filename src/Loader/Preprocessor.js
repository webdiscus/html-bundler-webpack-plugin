const { unsupportedPreprocessorException } = require('./Messages/Exeptions');

/** @typedef {import('webpack').LoaderContext} LoaderContext */

class Preprocessor {
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
   * Returns preprocessor to render/compile a template.
   * The default preprocessor uses the Eta templating engine.
   *
   * @param {Object} options The loader options.
   * @return {null|(function(string, {data?: {}}): Promise|null)}
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
   * The default preprocessor uses the Eta template engine.
   *
   * @param {LoaderContext} loaderContext The loader context of Webpack.
   * @param {string|null|*} preprocessor The preprocessor value, should be a string
   * @param {Object} options The preprocessor options.
   * @param {Function} watch The function called by watching.
   * @return {Function|Promise|Object}
   * @throws
   */
  static factory(loaderContext, { preprocessor, options = {}, watch }) {
    if (preprocessor == null) preprocessor = 'eta';

    switch (preprocessor) {
      case 'eta':
        return require('./Preprocessors/Eta/index.js')(loaderContext, options);

      case 'ejs':
        return require('./Preprocessors/Ejs/index.js')(loaderContext, options);

      case 'handlebars':
        return require('./Preprocessors/Handlebars/index.js')(loaderContext, options);

      case 'nunjucks':
        return require('./Preprocessors/Nunjucks/index.js')(loaderContext, options, watch);

      case 'twig':
        return require('./Preprocessors/Twig/index.js')(loaderContext, options);

      default:
        unsupportedPreprocessorException(preprocessor);
    }
  }

  static watchRun({ preprocessor }) {
    if (typeof preprocessor?.watch === 'function') {
      preprocessor.watch();
    }
  }
}

module.exports = Preprocessor;
