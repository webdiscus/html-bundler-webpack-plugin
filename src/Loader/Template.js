const Loader = require('./Loader');
const Options = require('./Options');

const spaceChars = [' ', '\t', '\n', '\r', '\f'];

const comparePos = (a, b) => a.startPos - b.startPos;

/**
 * Returns the first index of a space char.
 * The space char can be one of: space, tab, new line, carrier return, page break.
 *
 * @param {string} content
 * @param {number} startPos
 * @return {number}
 */
const indexOfSpace = (content, startPos = 0) => {
  const len = content.length;
  for (; spaceChars.indexOf(content.charAt(startPos)) < 0 && startPos < len; startPos++) {}

  return startPos < len ? startPos : -1;
};

/**
 * Returns the first index of a non-space char.
 * The space char can be one of: space, tab, new line, carrier return, page break.
 *
 * @param {string} content
 * @param {number} startPos
 * @return {number}
 */
const indexOfNonSpace = (content, startPos = 0) => {
  for (; spaceChars.indexOf(content.charAt(startPos)) > -1; startPos++) {}

  return startPos;
};

/**
 * Returns the first index of the searched char if none of the excluded chars was found before it.
 *
 * @param {string} search The search char.
 * @param {string} content Where to search for a char.
 * @param {number} startPos The offset in content.
 * @param {string} except A string containing chars that should not be before the searched character.
 * @return {number} TThe index of the found char, otherwise -1.
 */
const indexOfChar = (search, content, startPos = 0, except = '') => {
  let offset = 0;
  let char;

  while ((char = content.charAt(startPos))) {
    if (char === search) return startPos;
    if (offset++ > 0 && except.indexOf(char) > -1) return -1;
    startPos++;
  }

  return -1;
};

/**
 * Whether the link tag load a style or other assets.
 *
 * <link href="style.css" type="text/css" />
 * <link href="style.css" rel="alternate stylesheet" />
 * <link href="style.css" rel="preload" as="style" />
 * <link href="style.css" rel="preload" as="stylesheet" />
 *
 * @param {string} tag The tag with attributes.
 * @return {boolean}
 */
const isLinkStyle = (tag) => /(?:rel|as)=".*style.*"/.test(tag) || /type="text\/css"/.test(tag);

/**
 * Whether the link tag load a script.
 *
 * <link href="script.js" rel="prefetch" as="script" />
 * <link href="script.js" rel="preload" as="script" />
 * <link href="script.js" rel="modulepreload" />
 * <link href="script.js" rel="modulepreload" as="script" />
 * <link href="script.js" rel="modulepreload" as="worker" />
 * <link href="script.js" rel="modulepreload" as="serviceworker" />
 * <link href="script.js" rel="modulepreload" as="sharedworker" />
 *
 * @param {string} tag The tag with attributes.
 * @return {boolean}
 */
const isLinkScript = (tag) => {
  if (tag.indexOf('as="script"') > 0) return true;
  if (tag.indexOf('rel="modulepreload"') > 0) {
    if (tag.indexOf('as="') < 0) return true;
    return /as="(worker|serviceworker|sharedworker)"/.test(tag);
  }

  return false;
};

class Template {
  static sources = [];
  static root = false;
  static issuer;

  /**
   * Resolve all source resources in HTML.
   *
   * @param {string} html The source HTML string.
   * @param {string} issuer The template file.
   * @return {string}
   */
  static compile(html, issuer) {
    const sources = Options.getSources();

    if (sources === false) {
      return html;
    }

    this.sources = sources;
    this.issuer = issuer;
    this.root = Options.getBasedir();

    const tags = this.parseTags(html);
    const result = this.normalizeTagList(tags);
    let output = '';
    let pos = 0;

    for (let { type, file, startPos, endPos } of result) {
      const resolvedFile = this.resolve({ type, file, issuer });
      // skip not resolvable value, e.g. URL
      if (!resolvedFile) continue;

      output += html.slice(pos, startPos) + resolvedFile;
      pos = endPos;
    }

    return output + html.slice(pos);
  }

  /**
   * Resolve source file.
   *
   * Resolve relative path: href="./basic.css", href="../basic.css"
   * Resolve alias: href="@styles/basic.css", href="~Styles/basic.css", href="Styles/basic.css"
   * Resolve file with query: srcset="image.png?{sizes: [100,200,300], format: 'jpg'}"
   *
   * If the `loader.root` option is not false, then resolve a file with leading `/`: `/img/logo.png`
   *
   * Ignore:
   *  - https://example.com/style.css
   *  - http://example.com/style.css
   *  - //style.css
   *  - /style.css (ignore only if `loader.root` is false)
   *  - javascript:alert('hello')
   *  - data:image/png
   *  - mailto:admin@test.com
   *
   * @param {string} type The type of source: 'style', 'script', 'asset'.
   * @param {string} file The source file of resource.
   * @param {string} issuer The issuer of source file.
   * @return {string|boolean} Return a resolved full path of source file or false.
   */
  static resolve({ type, file, issuer }) {
    file = file.trim();

    if (
      (this.root === false && file.startsWith('/')) ||
      file.startsWith('//') ||
      file.startsWith('#') ||
      (file.indexOf(':') > 0 && file.indexOf('?{') < 0)
    ) {
      return false;
    }

    switch (type) {
      case 'style':
        return Loader.compiler.loaderRequireStyle(file, issuer);
      case 'script':
        return Loader.compiler.loaderRequireScript(file, issuer);
    }

    return Loader.compiler.loaderRequire(file, issuer);
  }

  /**
   * Transform a deep nested structure of parsed values to a flat one.
   *
   * @param {Array<{}>} tags
   * @return {Array<{}>}
   */
  static normalizeTagList(tags) {
    const result = [];

    for (let { type, startPos: tagStartPos, endPos: tagEndPos, attrs } of tags) {
      for (let { startPos: attrStartOffset, endPos: attrEndOffset, value } of attrs) {
        const attrStartPos = tagStartPos + attrStartOffset;

        if (Array.isArray(value)) {
          for (let { startPos: valueStartOffset, endPos: valueEndOffset, value: attrValue } of value) {
            let startPos = attrStartPos + valueStartOffset;
            let endPos = attrStartPos + valueEndOffset;

            result.push({
              type,
              file: attrValue,
              startPos,
              endPos,
            });
          }
        } else {
          let startPos = attrStartPos;
          let endPos = tagStartPos + attrEndOffset;

          result.push({
            type,
            file: value,
            startPos,
            endPos,
          });
        }
      }
    }

    return result;
  }

  /**
   * Parse all possible tags containing source resources.
   *
   * Note: following outdated tags will be not supported
   * - <embed type="image/jpg" src="..."> => better to use the <img src="...">
   * - <embed type="video/webm" src="..."> => better to use the <video src="...">
   * - <embed type="audio/mpeg" src="..."> => better to use the <audio src="...">
   *
   * @param {string} content
   * @return {Array<{}>}
   */
  static parseTags(content) {
    let result = [];
    for (let item of this.sources) {
      const parsedTags = this.parseTag(content, item);

      if (parsedTags.length > 0) {
        result = result.concat(parsedTags);
      }
    }

    return result.sort(comparePos);
  }

  /**
   * Parse values of tag attributes.
   *
   * @param {string} content The HTML content.
   * @param {string} tag The tag to parsing.
   * @param {string | Array<string>} attributes List of attributes to parsing.
   * @param {function | null} filter The function to exclude parsed attributes.
   * @return {Array<{}> | boolean}
   */
  static parseTag(content, { tag, attributes = [], filter }) {
    const resourcePath = this.issuer;
    const open = `<${tag}`;
    const close = '>';
    const result = [];
    let startPos = 0;
    let endPos = 0;

    while ((startPos = content.indexOf(open, startPos)) >= 0) {
      let attrValues = [];
      endPos = indexOfChar(close, content, startPos, '<');

      if (endPos < 1) {
        throw new Error(`The '${tag}' tag starting at ${startPos} position is missing the closing '>' char.`);
      }

      endPos += close.length;

      const source = content.slice(startPos, endPos);
      let type = 'asset';

      if (tag === 'script') {
        type = 'script';
      } else if (tag === 'link') {
        if (isLinkStyle(source)) type = 'style';
        else if (isLinkScript(source)) type = 'script';
      }

      for (let attribute of attributes) {
        const attrValue = this.parseAttr(source, attribute);
        if (attrValue === false) continue;

        let res = true;

        if (filter) {
          // parse all attributes only when is the filter defined
          const tagAttrs = this.parseAttrAll(source);
          let value = attrValue.value;

          if (Array.isArray(value)) {
            let values = [];
            for (let item of value) values.push(item.value);
            value = values;
          }
          tagAttrs[attribute] = value;
          res = filter({ tag, attribute, value, attributes: tagAttrs, resourcePath }) !== false;
        }
        res === true && attrValues.push(attrValue);
      }

      // sort attributes by pos
      if (attrValues.length > 1) {
        attrValues.sort(comparePos);
      }

      result.push({
        tag,
        source,
        type,
        attrs: attrValues,
        startPos,
        endPos,
      });

      startPos = endPos;
    }

    return result;
  }

  /**
   * Parse all attributes in the tag.
   *
   * @param {string} source
   * @return {{}}
   */
  static parseAttrAll(source) {
    let attrs = {};
    let pos = 1;
    let spacePos, attrStartPos, attrEndPos, valueStartPos, valueEndPos, attr;

    while (true) {
      spacePos = indexOfSpace(source, pos);
      // when no space between attributes
      if (spacePos < 0) spacePos = pos;
      attrStartPos = indexOfNonSpace(source, spacePos);
      attrEndPos = source.indexOf('="', attrStartPos);
      // no more attributes with value
      if (attrEndPos < 0) break;

      valueStartPos = attrEndPos + 2;
      valueEndPos = source.indexOf('"', valueStartPos);
      // not closed quote
      if (valueEndPos < 0) break;

      attr = source.slice(attrStartPos, attrEndPos);
      attrs[attr] = source.slice(valueStartPos, valueEndPos);
      pos = valueEndPos + 1;
    }

    return attrs;
  }

  /**
   * Parse the attribute in the tag.
   *
   * @param {string} source The source code of an HTML tag.
   * @param {string} attr The attribute to parse value.
   * @return {{attr: string, value: string, startPos: number, endPos: number}|boolean}
   */
  static parseAttr(source, attr) {
    const open = `${attr}="`;
    let startPos = 0;
    let pos;

    // find the starting position of an attribute with a leading space char
    do {
      pos = source.indexOf(open, startPos);
      startPos = pos + open.length;
    } while (pos > 0 && spaceChars.indexOf(source.charAt(pos - 1)) < 0);

    if (pos <= 0) return false;

    let endPos = source.indexOf('"', startPos);
    if (endPos < 0) endPos = source.length - 1;

    let value = source.slice(startPos, endPos);
    if (attr.indexOf('srcset') > -1) {
      value = this.parseSrcsetValue(value);
    }

    return { attr, value, startPos, endPos };
  }

  /**
   * Parse srcset attribute.
   *
   * Possible values:
   *   "img1.png"
   *   "img1.png, img2.png 100w, img3.png 1.5x"
   *
   * @param {string} srcsetValue
   * @return {Array<{}>}
   */
  static parseSrcsetValue(srcsetValue) {
    const lastPos = srcsetValue.length;
    let startPos = 0;
    let endPos = 0;
    let currentPos;
    let values = [];

    // support for 'responsive-loader' value, e.g.: image.png?{sizes: [100,200,300], format: 'jpg'}
    if (srcsetValue.indexOf('?{') > 0) {
      return [{ value: srcsetValue, startPos, endPos: srcsetValue.length }];
    }

    do {
      currentPos = srcsetValue.indexOf(',', startPos);
      if (currentPos < 0) {
        currentPos = lastPos;
      }

      startPos = indexOfNonSpace(srcsetValue, startPos);

      // parse value like "img.png"
      let value = srcsetValue.slice(startPos, currentPos);
      let pos = value.indexOf(' ');

      // parse value like "img.png 100w"
      if (pos > 0) {
        value = value.slice(0, pos);
        endPos = startPos + pos;
      } else {
        endPos = currentPos;
      }

      values.push({ value, startPos, endPos });
      startPos = currentPos + 1;
    } while (currentPos < lastPos);

    return values;
  }
}

module.exports = Template;
