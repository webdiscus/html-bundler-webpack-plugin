class Filter {
  static MarkdownFilter = null;

  static getInstance(options) {
    if (!this.MarkdownFilter) {
      // lazy load module only on demand
      this.MarkdownFilter = require('./MarkdownFilter');
      this.MarkdownFilter.init(options);
    }

    return this.MarkdownFilter;
  }
}

module.exports = Filter;
