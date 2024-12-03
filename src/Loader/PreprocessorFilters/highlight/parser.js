const parse5 = require('parse5');

const parser = {
  entries: {},
  entryIndex: 0,
  langPrefix: '',

  /**
   * @param {string} prefix
   * @public
   * @api
   */
  init({ langPrefix }) {
    this.langPrefix = langPrefix;
  },

  /**
   * @param {string} text
   * @param {string} language
   * @returns {string}
   * @abstract The abstract method must be overridden with your implementation.
   * @public
   * @api
   */
  highlight(text, language) {
    throw new Error('You have to implement the abstract method highlight().');
  },

  /**
   * @param {string} text
   * @returns {string}
   * @public
   * @api
   */
  highlightAll(text) {
    const document = parse5.parseFragment(text);
    this.entryIndex = 0;
    this.entries = {};

    // autodetect code in document and save highlighted code in entries
    this.walk(document);

    // text contains marked placeholders that are replaced with highlighted code
    text = parse5.serialize(document);
    for (let marker in this.entries) {
      const { lang, value } = this.entries[marker];
      text = text.replace(marker, this.highlight(value, lang));
    }

    return text;
  },

  /**
   * @param {{name: string, value: string}[]} attrs The node attributes.
   * @returns {string}
   * @private
   */
  getLanguage(attrs) {
    let lang = '';

    if (attrs != null) {
      const attr = attrs.find(
        (item) => item.name === 'class' && (item.value.startsWith(this.langPrefix) || item.value.startsWith('lang-'))
      );

      if (attr) {
        lang = attr.value.replace(this.langPrefix, '').replace('lang-', '');
      }
    }

    return lang;
  },

  /**
   * @param {{attrs: {name: string, value: string}[]}} node The node
   * @param {string} lang
   * @private
   */
  setLanguage(node, lang) {
    const attrClass = node.attrs.find((item) => item.name === 'class');
    const className = this.langPrefix + lang;

    if (attrClass) {
      let classes = attrClass.value.split(' ').filter((item) => !item.startsWith(this.langPrefix));
      classes.push(className);
      attrClass.value = classes.join(' ');
    } else {
      node.attrs.push({ name: 'class', value: className });
    }
  },

  /**
   * Traverse parsed HTML nodes and detect a code block with language.
   *
   * @param {{} | []} obj A traversable object.
   * @private
   */
  walk(obj) {
    for (let key in obj) {
      const node = obj[key];

      if (node.childNodes != null) {
        this.walk(node.childNodes);
      } else if (Array.isArray(node)) {
        this.walk(node);
      }

      if (node.nodeName === '#text') {
        let parentNode = node.parentNode;
        if (parentNode != null && parentNode.nodeName === 'code') {
          // match language in class name of `code` or `pre` tags
          let language = this.getLanguage(parentNode.attrs);
          parentNode = parentNode.parentNode;

          if (parentNode != null && parentNode.nodeName === 'pre') {
            if (!language) {
              language = this.getLanguage(parentNode.attrs);
            }

            // set lang prefix as class name  in <pre> tag
            this.setLanguage(parentNode, language);
          }

          if (language) {
            let marker = `__HL_MARKER_${this.entryIndex++}__`;
            this.entries[marker] = {
              lang: language,
              value: node.value,
            };
            node.value = marker;
          }
        }
      }
    }
  },
};

module.exports = parser;
