class Filter {
  static MarkdownFilter = null;

  static init(options) {
    if (!this.MarkdownFilter) {
      // lazy load module only on demand
      this.MarkdownFilter = require('../../../PreprocessorFilters/markdown/MarkdownFilter');
    }
    this.MarkdownFilter.init(options);
  }

  static apply(content) {
    return this.MarkdownFilter.apply(content);
  }
}

module.exports = Filter;
