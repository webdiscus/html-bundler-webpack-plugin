// Performance notes:
// - comparing numbers is faster than comparing strings
// - transforming a string to a byte array with TextEncoder.encode() is 100x faster than charCodeAt() via `for` loop

const textEncoder = new TextEncoder();
const spaceCodes = textEncoder.encode(' \n\r\t\f');

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
  for (; spaceCodes.indexOf(content.charCodeAt(startPos)) < 0 && startPos < len; startPos++) {}

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
  for (; spaceCodes.indexOf(content.charCodeAt(startPos)) > -1; startPos++) {}

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
  const searchCode = search.charCodeAt(0);
  const exceptCodes = textEncoder.encode(except);
  let offset = 0;
  let code;

  while ((code = content.charCodeAt(startPos))) {
    if (code === searchCode) return startPos;
    if (offset++ > 0 && exceptCodes.indexOf(code) > -1) return -1;
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

class HtmlParser {
  /**
   * Parse values of tag attributes.
   *
   * @param {string} content The HTML content.
   * @param {string} tag The tag to parsing.
   * @param {string | Array<string>} attributes List of attributes to parsing.
   * @param {function | null} filter The function to exclude parsed attributes.
   * @param {string} resourcePath The file of content. This is passed into the filter function.
   * @return {Array<{}> | boolean}
   */
  static parseTag(content, { tag, attributes = [], filter, resourcePath = '' }) {
    const open = `<${tag}`;
    const close = '>';
    const result = [];
    let startPos = 0;
    let endPos = 0;

    while ((startPos = content.indexOf(open, startPos)) >= 0) {
      const parsedAttrs = [];
      endPos = indexOfChar(close, content, startPos, '<');

      if (endPos < 1) {
        throw new Error(`The '${tag}' tag starting at ${startPos} position is missing the closing '>' char.`);
      }

      endPos += close.length;

      const source = content.slice(startPos, endPos);
      let type = 'asset';
      let attrs = null;

      if (tag === 'script') {
        type = 'script';
      } else if (tag === 'link') {
        if (isLinkStyle(source)) type = 'style';
        else if (isLinkScript(source)) type = 'script';
      }

      for (let attribute of attributes) {
        const parsedAttr = this.parseAttr(source, attribute, type, startPos);
        if (parsedAttr === false) continue;

        let res = true;

        if (filter) {
          let value = parsedAttr.value;

          // when is the filter defined, parse all attributes once
          if (!attrs) {
            attrs = this.parseAttrAll(source);
          }

          res = filter({ tag, attribute, value, attributes: attrs, resourcePath }) !== false;
        }

        if (res === true) {
          if (parsedAttr.attrs) {
            parsedAttrs.push(...parsedAttr.attrs);
          } else {
            parsedAttrs.push(parsedAttr);
          }
        }
      }

      // sort attributes by pos
      if (parsedAttrs.length > 1) {
        parsedAttrs.sort(comparePos);
      }

      result.push({
        tag,
        source,
        type,
        parsedAttrs,
        attrs,
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
   * @param {string} content The HTML tag.
   * @return {{ [k: string]: string }}
   */
  static parseAttrAll(content) {
    let attrs = {};
    let pos = 1;
    let spacePos, attrStartPos, attrEndPos, valueStartPos, valueEndPos, attr;

    while (true) {
      spacePos = indexOfSpace(content, pos);
      // when no space between attributes
      if (spacePos < 0) spacePos = pos;
      attrStartPos = indexOfNonSpace(content, spacePos);
      attrEndPos = content.indexOf('="', attrStartPos);
      // no more attributes with value
      if (attrEndPos < 0) break;

      valueStartPos = attrEndPos + 2;
      valueEndPos = content.indexOf('"', valueStartPos);
      // not closed quote
      if (valueEndPos < 0) break;

      attr = content.slice(attrStartPos, attrEndPos);
      attrs[attr] = content.slice(valueStartPos, valueEndPos);
      pos = valueEndPos + 1;
    }

    return attrs;
  }

  /**
   * Parse the attribute in the tag.
   *
   * @param {string} content The HTML tag.
   * @param {string} attr The attribute to parse value.
   * @param {string} type The type of attribute value.
   * @param {Number} offset The absolute tag offset in the content.
   * @return {{attr: string, attrs?: Array, value: string|Array<string>, startPos: number, endPos: number}|boolean}
   */
  static parseAttr(content, attr, type = 'asset', offset = 0) {
    const open = `${attr}="`;
    let startPos = 0;
    let pos;

    // find the starting position of an attribute with a leading space char
    do {
      pos = content.indexOf(open, startPos);
      startPos = pos + open.length;
    } while (pos > 0 && spaceCodes.indexOf(content.charCodeAt(pos - 1)) < 0);

    if (pos <= 0) return false;

    let endPos = content.indexOf('"', startPos);
    if (endPos < 0) endPos = content.length - 1;

    let value = content.slice(startPos, endPos);
    if (attr.indexOf('srcset') > -1) {
      const { values, attrs } = this.parseSrcsetValue(value, startPos, offset);

      return {
        attr,
        attrs,
        value: values,
        startPos,
        endPos,
        offset,
      };
    }

    return { type, attr, value, startPos, endPos, offset };
  }

  /**
   * Parse srcset attribute.
   *
   * Possible values:
   *   "img1.png"
   *   "img1.png, img2.png 100w, img3.png 1.5x"
   *
   * @param {string} srcsetValue
   * @param {Number} valueOffset The offset of value in the tag.
   * @param {Number} offset The absolute tag offset in the content.
   * @return {{values: Array<string>, attrs: [{attr: string, value, startPos: Number, endPos: Number}]}}
   */
  static parseSrcsetValue(srcsetValue, valueOffset, offset) {
    const lastPos = srcsetValue.length;
    let startPos = 0;
    let endPos = 0;
    let currentPos;
    let values = [];
    let attrs = [];
    const type = 'asset';

    // support for 'responsive-loader' value, e.g.: image.png?{sizes: [100,200,300], format: 'jpg'}
    if (srcsetValue.indexOf('?{') > 0) {
      return {
        values: [srcsetValue],
        attrs: [
          { type, attr: 'srcset', value: srcsetValue, startPos: valueOffset, endPos: valueOffset + lastPos, offset },
        ],
      };
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

      values.push(value);

      attrs.push({
        type,
        attr: 'srcset',
        value,
        startPos: valueOffset + startPos,
        endPos: valueOffset + endPos,
        offset,
      });

      startPos = currentPos + 1;
    } while (currentPos < lastPos);

    return { values, attrs };
  }
}

module.exports = { HtmlParser, comparePos };
