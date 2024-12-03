const markdown = require('../../../../PreprocessorFilters/markdown');

class Filter {
  static init(options) {
    markdown.init(options);
  }

  static apply(content) {
    return markdown.apply(content);
  }
}

module.exports = Filter;
