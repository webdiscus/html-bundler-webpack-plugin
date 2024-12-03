const { green, cyan } = require('ansis');
const parser = require('./parser');
const { labelError } = require('../../Utils');

/**
 * The adapter (bridge, wrapper) provide one interface for different highlighting modules
 * such as `prismjs` or `highlight.js`.
 *
 * @singleton
 */

const adapter = {
  verbose: false,
  module: null,
  supportedModules: new Set([
    'prismjs',
    //'highlight.js', // reserved for next release
  ]),

  /**
   * @param {Object | string} use The used npm module of highlighting.
   * @public
   * @api
   */
  init(use) {
    if (this.module != null) return;

    let moduleName;
    let moduleOptions = {};

    if (typeof use === 'string') {
      moduleName = use;
    } else {
      moduleName = use.module;
      if (use.options) moduleOptions = use.options;
    }

    this.verbose = moduleOptions.verbose === true;

    const label = `highlight adapter`;

    if (!moduleName || !this.supportedModules.has(moduleName)) {
      const error =
        `\n${labelError(label)} Used unsupported module ${cyan('"' + moduleName + '"')}.\n` +
        `Supported modules: ` +
        green(this.getNamesOfSupportedModules().join(', ')) +
        '.';
      throw new Error(error);
    }

    const modulePath = `./${moduleName.replace(/\./g, '')}.js`;
    this.module = require(modulePath);
    this.module.init(moduleOptions);

    parser.init({
      langPrefix: this.getLangPrefix(),
    });

    // override the abstract highlight method
    parser.highlight = this.module.highlight.bind(this.module);
  },

  /**
   * @returns {boolean}
   * @public
   * @api
   */
  isInitialized() {
    return this.module != null;
  },

  /**
   * Whether the highlighting module is supported.
   *
   * @param {string} moduleName
   * @returns {boolean}
   * @public
   * @api
   */
  isSupported(moduleName) {
    return this.supportedModules.has(moduleName);
  },

  /**
   * @returns {string[]}
   * @public
   * @api
   */
  getNamesOfSupportedModules() {
    return Array.from(this.supportedModules);
  },

  /**
   * @returns {string}
   * @public
   * @api
   */
  getLangPrefix() {
    return this.module.getLangPrefix();
  },

  /**
   * Highlight a code by the language.
   *
   * @param {string} text
   * @param {string | null} language
   * @returns {string}
   * @public
   * @api
   */
  highlight(text, language) {
    return this.module.highlight(text, language);
  },

  /**
   * Autodetect language in code and highlight all founded codes.
   *
   * @param {string} text
   * @returns {string}
   * @public
   * @api
   */
  highlightAll(text) {
    return parser.highlightAll(text);
  },
};

module.exports = adapter;
