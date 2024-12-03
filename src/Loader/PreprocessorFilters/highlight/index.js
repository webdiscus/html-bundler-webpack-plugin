const adapter = require('./adapter');
const { deepMerge } = require('../../../Common/Helpers');

// for usage the `[]` chars in pug inline filter, the chars must be written as HTML entity
// e,g. the `#[:highlight(js) const arr = [1, 2];]` must be as `#[:highlight(js) const arr = &lbrack;1, 2&rbrack;;]`,
// but for tokenize is needed to decode HTML entities in normal chars
const reservedChars = /&lbrack;|&rbrack;/g;
const charReplacements = {
  '&lbrack;': '[',
  '&rbrack;': ']',
};

/**
 * Embedded filter highlight.
 * @singleton
 */
const filter = {
  name: 'highlight',

  /**
   * Initialize the filter.
   *
   * @param {Object} options
   *
   * @public
   * @api
   */
  init(options = {}) {
    if (adapter.isInitialized()) return;

    const defaultOptions = {
      use: {
        // the name of a using highlight npm module.
        module: 'prismjs',
        options: {
          // display in console warnings and loaded dependencies
          verbose: false,
        },
      },
    };

    // TODO: cache module by webpack compiler (pro config)
    options = deepMerge(defaultOptions, options);

    adapter.init(options.use);
  },

  /**
   * Apply the filter.
   *
   * @param {string} text
   * @param {{language: {string}, value: {any}}} options
   * @returns {string}
   * @public
   * @api
   */
  apply(text, options) {
    let [language] = Object.keys(options);

    // if first item of options is `filename` then no language was defined in filter
    language = language !== 'filename' ? language.toLowerCase() : null;

    // supports for `[]` chars in pug inline filter
    text = text.replace(reservedChars, (str) => charReplacements[str]);

    return language ? adapter.highlight(text, language) : adapter.highlightAll(text);
  },
};

module.exports = filter;
