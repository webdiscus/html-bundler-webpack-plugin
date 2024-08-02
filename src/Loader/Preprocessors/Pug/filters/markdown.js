const { resolveModule } = require('../../../Utils');
const { loadNodeModuleException } = require('../Exeptions');
const adapter = require('./highlight/adapter');

/**
 * Embedded filter markdown.
 * @singleton
 */
const markdown = {
  name: 'markdown',
  moduleName: 'markdown-it',
  module: null,
  langPrefix: '',

  /**
   * Initialize the filter.
   *
   * @param {boolean} verbose Display in console warnings and highlighting info.
   *  When a code is not highlighted enable it to show possible warnings by using not supported languages.
   * @param {{use: string, verbose: boolean} | null} highlight The name of a using highlight npm module. The module must be installed.
   * @param {string} langPrefix CSS language prefix for fenced blocks of code. Can be useful for external highlighters.
   *  Use this option only if used external highlighters on frontend, in browser.
   *  If the option {highlight: {use: '...'}} is used then langPrefix is ignored.
   * @param {boolean} github Apply github syntax styles.
   * @public
   * @api
   */
  init({ highlight, langPrefix, github }) {
    // TODO: cache module by webpack compiler (pro config)
    //if (this.module != null) return;

    const moduleFile = resolveModule(this.moduleName);

    if (!moduleFile) {
      loadNodeModuleException(this.moduleName);
    }

    const MarkdownIt = require(moduleFile);

    this.github = github === true;

    let options = {
      // enable HTML tags in markdown source
      html: true,
    };

    if (highlight != null && highlight.use) {
      adapter.init({
        verbose: highlight.verbose === true,
        use: highlight.use,
      });

      langPrefix = adapter.getLangPrefix();
      options.highlight = (text, lang) => {
        return `<pre class="${langPrefix}${lang}"><code>` + adapter.highlight(text, lang) + '</code></pre>';
      };
    } else if (langPrefix) {
      options.highlight = (text, lang) => {
        return `<pre class="${langPrefix}${lang}"><code>` + text + '</code></pre>';
      };
    }

    this.module = new MarkdownIt(options);
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
    if (this.github) {
      content = this.applyGithubSyntax(content);
    }

    return this.module.render(content);
  },

  /**
   * Apply github syntax styles for Note, Warning.
   *
   * @param {string} content
   * @return {string}
   */
  applyGithubSyntax(content) {
    const match = /(\*\*Note\*\*|\*\*Warning\*\*)/g;
    const replacements = {
      '**Note**':
        '<span class="color-fg-accent"><svg class="octicon octicon-info mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"></path></svg>Note</span>',
      '**Warning**':
        '<span class="color-fg-attention"><svg class="octicon octicon-alert mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"></path></svg>Warning</span>',
    };

    return content.replace(match, (value) => replacements[value]);
  },
};

module.exports = markdown;
