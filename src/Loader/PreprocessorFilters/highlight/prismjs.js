const path = require('path');
const { red, cyan } = require('ansis');
const { outToConsole } = require('../../../Common/Helpers');
const { loadModule } = require('../../../Common/FileUtils');
const { labelInfo, labelWarn } = require('../../Utils');

const label = `html-bundler:filter:highlight:prismjs`;

const prismjs = {
  name: 'prismjs',
  moduleName: 'prismjs',
  prefix: 'language-',
  verbose: false,
  module: null,
  modulePath: null,
  supportedLanguages: new Set(),
  loadedLanguages: new Set(),

  /**
   * @param {boolean} [verbose=false] Enable output info in console.
   * @public
   * @api
   */
  init({ verbose = false }) {
    if (this.module != null) return;

    this.module = loadModule(this.moduleName);

    const moduleFile = require.resolve(this.moduleName);

    // init language loader
    this.modulePath = path.dirname(moduleFile);
    this.components = require(path.join(this.modulePath, 'components.js'));
    this.getLoader = require(path.join(this.modulePath, 'dependencies.js'));

    this.verbose = verbose;

    // generate list of supported languages
    const languages = this.components.languages;
    for (let lang in languages) {
      if (lang === 'meta') continue;
      const alias = languages[lang].alias;
      this.supportedLanguages.add(lang);
      if (alias) {
        Array.isArray(alias)
          ? alias.forEach(this.supportedLanguages.add, this.supportedLanguages)
          : this.supportedLanguages.add(alias);
      }
    }
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
   * @returns {string}
   * @public
   * @api
   */
  getLangPrefix() {
    return this.prefix;
  },

  /**
   * @param {string} text
   * @param {string} language
   * @returns {string}
   * @public
   * @api
   */
  highlight(text, language) {
    const Prism = this.module;
    language = language.toLowerCase();

    if (!language) return text;

    // lazy load a language
    if (!Prism.languages.hasOwnProperty(language)) {
      if (this.loadLanguage(language) === false) {
        // if the language is not supported bypass original text
        return text;
      }
    }

    return Prism.highlight(text, Prism.languages[language], language);
  },

  /**
   * @param {string} language
   * @private
   */
  loadLanguage(language) {
    if (!this.supportedLanguages.has(language)) {
      if (this.verbose) {
        outToConsole(`${labelWarn(label)} Unsupported language '${red(language)}' is ignored!\n`);
      }
      return false;
    }

    const Prism = this.module;
    let { components, loadedLanguages, getLoader, modulePath } = this;

    // the user might have loaded languages via some other way or used `prism.js` which already includes some
    // we don't need to validate the ids because `getLoader` will ignore invalid ones
    const loaded = [...loadedLanguages, ...Object.keys(Prism.languages)];

    if (this.verbose) {
      outToConsole(`${labelInfo(label)} Load language ${cyan(language)}`);
    }

    getLoader(components, [language], loaded).load((lang) => {
      if (!loadedLanguages.has(lang)) {
        const pathToLanguage = path.join(modulePath, 'components/prism-' + lang + '.min.js');
        loadedLanguages.add(lang);

        // remove from require cache and from Prism
        delete require.cache[pathToLanguage];
        delete Prism.languages[lang];

        if (this.verbose && language !== lang) {
          outToConsole(` - load dependency ${cyan(lang)}`);
        }

        require(pathToLanguage);
      }
    });

    return true;
  },
};

module.exports = prismjs;
