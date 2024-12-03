const adapter = require('../highlight/adapter');
const { resolveModule } = require('../../Utils');
const { deepMerge } = require('../../../Common/Helpers');
const { loadNodeModuleException } = require('../Exeptions');

const GitHubAlertsExtension = require('./extensions/GitHubAlertsExtension');

/**
 * @typedef {Object} MarkdownExtension
 * @param {(function(options: Object): Object)} init Initialize MarkdownIt options.
 * @param {(function(content: string): string)} beforeRender Calls before render markdown.
 * @param {(function(content: string): string)} afterRender Calls after render markdown.
 */

/**
 * Embedded filter markdown.
 * @singleton
 */
const filter = {
  name: 'markdown',
  moduleName: 'markdown-it',
  module: null,

  /**
   * Initialize the filter.
   *
   * @param {Object} options
   *
   * @public
   * @api
   */
  init(options = {}) {
    const defaultOptions = {
      highlight: {
        use: {
          // the name of a using highlight npm module.
          module: 'prismjs',
          options: {
            // display in console warnings and loaded dependencies
            verbose: true,
          },
        },
      },
    };

    // TODO: cache module by webpack compiler (pro config)
    options = deepMerge(defaultOptions, options);

    let langPrefix = options.highlight.langPrefix;
    let use = options.highlight.use;
    const moduleFile = resolveModule(this.moduleName);

    if (!moduleFile) {
      loadNodeModuleException(this.moduleName);
    }

    const MarkdownIt = require(moduleFile);

    // Render custom markdown elements, e.g. GitHub alerts.
    this.extensions = [GitHubAlertsExtension];

    let markdownItOptions = {
      // enable HTML tags in markdown source
      html: true,
    };

    if (use) {
      adapter.init(use);

      langPrefix = adapter.getLangPrefix();
      markdownItOptions.highlight = (text, lang) => {
        return `<pre class="${langPrefix}${lang}"><code>` + adapter.highlight(text, lang) + '</code></pre>';
      };
    }

    markdownItOptions = this.tap('init', markdownItOptions);

    this.module = new MarkdownIt(markdownItOptions);
  },

  /**
   * Apply the filter.
   *
   * @param {string} content
   * @returns {string}
   * @public
   * @api
   */
  apply(content) {
    content = this.tap('beforeRender', content);
    content = this.module.render(content);
    content = this.tap('afterRender', content);

    return content;
  },

  /**
   * Call the method of all registered extensions.
   *
   * @param {string} name The method name.
   * @param {*} input The argument of callable method. If you have many arguments, use an object.
   * @return {*}
   */
  tap(name, input) {
    let output = input;

    if (this.extensions) {
      this.extensions.forEach((extension) => {
        if (typeof extension[name] === 'function') {
          output = extension[name](output);
        }
      });
    }

    return output;
  },
};

module.exports = filter;
