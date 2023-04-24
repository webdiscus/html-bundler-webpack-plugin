const { unsupportedPreprocessorException } = require('./Messages/Exeptions');

class Preprocessor {
  static init({ fileSystem, rootContext, watch }) {
    this.fileSystem = fileSystem;
    this.rootContext = rootContext;
    this.watch = watch;
  }

  /**
   * Whether the preprocessor is ready to use.
   *
   * @param {*} preprocessor
   * @return {boolean}
   */
  static isReady(preprocessor) {
    // disabled preprocessor
    if (preprocessor === false) return true;
    return typeof (preprocessor?.render || preprocessor) === 'function';
  }

  /**
   * Returns preprocessor to compile a template.
   * The default preprocessor uses the Eta templating engine.
   *
   * @param {Object} options The loader options.
   * @return {null|(function(string, {data?: {}}): Promise|null)}
   */
  static getPreprocessor(options) {
    const preprocessor = options.preprocessor;

    if (typeof preprocessor === 'function') return preprocessor;
    if (typeof preprocessor?.render === 'function') return preprocessor.render;

    return null;
  }

  /**
   * Factory preprocessor as a function.
   * The default preprocessor uses the Eta template engine.
   *
   * @param {string|null|*} preprocessor The preprocessor value, should be a string
   * @param {Object} options The preprocessor options.
   * @return {Function|Promise|Object}
   * @throws
   */
  static factory(preprocessor, options = {}) {
    if (preprocessor == null) preprocessor = 'eta';

    switch (preprocessor) {
      case 'eta':
        return require('./Preprocessors/Eta/index')({
          rootContext: this.rootContext,
          options,
        });

      case 'ejs':
        return require('./Preprocessors/Ejs/index')({
          rootContext: this.rootContext,
          options,
        });

      case 'handlebars':
        return require('./Preprocessors/Handlebars/index')({
          fs: this.fileSystem,
          rootContext: this.rootContext,
          options,
        });

      case 'nunjucks':
        return require('./Preprocessors/Nunjucks/index')({
          watch: this.watch,
          rootContext: this.rootContext,
          options,
        });

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
