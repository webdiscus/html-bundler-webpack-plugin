// Performance notes:
// - comparing numbers is faster than comparing strings
// - transforming a string to a byte array with TextEncoder.encode() is 100x faster than charCodeAt() via `for` loop

const textEncoder = new TextEncoder();
const spaceCodes = textEncoder.encode(' \n\r\t\f');
const tagEndCodes = textEncoder.encode(' \n\r\t\f/>');
const valueSeparatorCodes = textEncoder.encode('= \n\r\t\f');
const equalCode = '='.charCodeAt(0);
const escapeCode = `\\`.charCodeAt(0);
const quotCodes = textEncoder.encode(`"'`);

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
 * Returns the first index of an attribute/value separator char.
 * The char can be one of: =, space, tab, new line, carrier return, page break.
 *
 * @param {string} content
 * @param {number} startPos
 * @return {number}
 */
const indexOfValueSeparator = (content, startPos = 0) => {
  const len = content.length;
  for (; valueSeparatorCodes.indexOf(content.charCodeAt(startPos)) < 0 && startPos < len; startPos++) {}

  return startPos < len ? startPos : -1;
};

/**
 * Returns the first index of a quote.
 * The quote can be escaped, e.g. attr=\"value\" in a template function code.
 *
 * @param {string} content
 * @param {number} startPos
 * @return {number}
 */
const indexOfQuote = (content, startPos = 0) => {
  const len = content.length;
  for (; quotCodes.indexOf(content.charCodeAt(startPos)) < 0 && startPos < len; startPos++) {}

  return startPos < len ? startPos : -1;
};

/**
 * Return end position of the last attribute in a tag.
 *
 * @param {string} content The tag content.
 * @param {number} startAttrsPos The start position of first attribute.
 * @return {number}
 */
const indexOfAttributesEnd = (content, startAttrsPos) => {
  const len = content.length;
  let pos = content.length - 1;

  for (; tagEndCodes.indexOf(content.charCodeAt(pos)) >= 0 && pos > 0; pos--) {}

  return pos < len && pos > startAttrsPos ? pos : -1;
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
          const { value, parsedValue } = parsedAttr;

          // when is the filter defined, parse all attributes once
          if (!attrs) {
            attrs = this.parseAttrAll(source);
          }

          res = filter({ tag, attribute, value, parsedValue, attributes: attrs, resourcePath }) !== false;
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
    let pos = indexOfSpace(content, 1);

    // no attributes
    if (pos < 0) return attrs;

    let attrsEndPos = indexOfAttributesEnd(content, pos);

    // no attributes
    if (attrsEndPos < 0) return attrs;

    while (pos < attrsEndPos) {
      let attrStartPos = indexOfNonSpace(content, pos);
      pos = indexOfValueSeparator(content, attrStartPos + 1);
      let hasValue = pos >= 0 && content.charCodeAt(pos) === equalCode;

      if (pos < 0) pos = attrsEndPos + 1;

      let attr = content.slice(attrStartPos, pos);
      let value = undefined;

      if (hasValue) {
        // TODO: allow a space around equal, e.g., `attr =  value`
        let valueStartPos = pos + 1;
        let valueEndPos = -1;
        let nextCharCode = content.charCodeAt(valueStartPos);
        let isEscaped = false;

        if (nextCharCode === escapeCode) {
          isEscaped = true;
          nextCharCode = content.charCodeAt(++valueStartPos);
        }

        if (quotCodes.indexOf(nextCharCode) >= 0) {
          // value with quotes
          let quote = String.fromCharCode([nextCharCode]);
          if (isEscaped) quote = `\\` + quote;

          valueEndPos = content.indexOf(quote, ++valueStartPos);
          if (valueEndPos > -1) pos = valueEndPos + 1;
        } else {
          // value w/o quotes
          valueEndPos = indexOfSpace(content, valueStartPos);
          if (valueEndPos > -1) pos = valueEndPos;
        }

        if (valueEndPos < 0) {
          valueEndPos = attrsEndPos + 1;
          pos = valueEndPos;
        }

        value = content.slice(valueStartPos, valueEndPos);
      }

      attrs[attr] = value;
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
   * @return {{attr: string, attrs?: Array, value: string, parsedValue: Array<string>, startPos: number, endPos: number, offset: number, inEscapedDoubleQuotes: boolean}|boolean}
   */
  static parseAttr(content, attr, type = 'asset', offset = 0) {
    const open = `${attr}=`;
    let startPos = 0;
    let pos;

    // find the starting position of an attribute with a leading space char
    do {
      pos = content.indexOf(open, startPos);
      startPos = pos + open.length;
    } while (pos > 0 && spaceCodes.indexOf(content.charCodeAt(pos - 1)) < 0);

    if (pos <= 0) return false;

    // Note:
    // 1. The HTML string contains the normal quote:
    //    <img src="image.png">
    //    the require function should be injected as:
    //    module.exports = '<img src="' + require('image.png') + '">'

    // 2. The template function can contain the escaped quote, e.g.:
    //    fn("<img src=\"image.png\">")
    //    the require function should be injected as:
    //    module.exports = fn("<img src=\"" + require('image.png') + "\">")

    // find open quote pos
    startPos = content.indexOf('"', startPos);
    let inEscapedDoubleQuotes = content.charCodeAt(startPos - 1) === escapeCode;
    let quote = inEscapedDoubleQuotes ? `\\"` : '"';

    // find close quote pos
    startPos++;
    let endPos = content.indexOf(quote, startPos);
    if (endPos < 0) endPos = content.length - 1;

    let value = content.slice(startPos, endPos);

    if (attr.indexOf('srcset') > -1) {
      const { values, attrs } = this.parseSrcsetValue(value, startPos, offset, inEscapedDoubleQuotes);

      return {
        attr,
        attrs,
        value,
        parsedValue: values,
        startPos,
        endPos,
        offset,
        inEscapedDoubleQuotes,
      };
    }

    return {
      type,
      attr,
      value,
      parsedValue: [value.split('?', 1)[0]],
      startPos,
      endPos,
      offset,
      inEscapedDoubleQuotes,
    };
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
   * @param {boolean} inEscapedDoubleQuotes Bypass the property to all `attrs` objects.
   * @return {{values: Array<string>, attrs: [{attr: string, value, startPos: Number, endPos: Number, offset: number, inEscapedDoubleQuotes: boolean}]}}
   */
  static parseSrcsetValue(srcsetValue, valueOffset, offset, inEscapedDoubleQuotes) {
    const lastPos = srcsetValue.length;
    let startPos = 0;
    let endPos = 0;
    let currentPos;
    let values = [];
    let attrs = [];
    const type = 'asset';

    // supports the query for 'responsive-loader' in following notations:
    // - image.png?{sizes: [100,200,300], format: 'jpg'} // JSON5
    // - require('image.png?sizes[]=100,sizes[]=200,sizes[]=300,format=jpg') // `,` as parameter separator in require(), used in pug
    if (srcsetValue.indexOf('?{') > 0 || srcsetValue.indexOf('require(') > -1) {
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

      values.push(value.split('?', 1)[0]);

      attrs.push({
        type,
        attr: 'srcset',
        value,
        startPos: valueOffset + startPos,
        endPos: valueOffset + endPos,
        offset,
        inEscapedDoubleQuotes,
      });

      startPos = currentPos + 1;
    } while (currentPos < lastPos);

    return { values, attrs };
  }
}

module.exports = { HtmlParser, comparePos };
