/**
 * The `:highlight` filter highlights code syntax.
 *
 * Usage:
 *
 *  pre: code
 *    :highlight(html)
 *      <a href="home.html">Home</a>
 */

const highlight = require('../../../PreprocessorFilters/highlight');

class Filter {
  static init(options) {
    highlight.init(options);
  }

  static apply(content, options) {
    return highlight.apply(content, options);
  }
}

module.exports = Filter;
