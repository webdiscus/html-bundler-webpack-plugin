// Performance notes:
// - comparing numbers is faster than comparing strings
// - transforming a string to a byte array with TextEncoder.encode() is 100x faster than charCodeAt() via `for` loop

const textEncoder = new TextEncoder();
const spaceCodes = textEncoder.encode(' \n\r\t\f');
const valueSeparatorCodes = textEncoder.encode('= \n\r\t\f');
const slashCode = '/'.charCodeAt(0);
const tagStartCode = '<'.charCodeAt(0);
const tagEndCode = '>'.charCodeAt(0);
const equalCode = '='.charCodeAt(0);
const escapeCode = `\\`.charCodeAt(0);
const quotCodes = textEncoder.encode(`"'`);

const comparePos = (a, b) => a.startPos - b.startPos;

/**
 * Returns the first index of a non-space char.
 * The space char can be one of: space, tab, new line, carrier return, page break.
 *
 * @param {string} content
 * @param {number} pos
 * @return {number}
 */
const indexOfNonSpace = (content, pos = 0) => {
  for (; spaceCodes.indexOf(content.charCodeAt(pos)) > -1; pos++) {}

  return pos;
};

/**
 * Returns the first index of a space char or current position.
 * The space char can be one of: space, tab, new line, carrier return, page break.
 *
 * @param {string} content The tag raw content.
 * @param {string} tagName Used for exception only.
 * @param {number} startPos Used for exception only.
 * @param {number} pos The current position in the content.
 * @return {{pos: number, tagEnd: boolean}} The `pos` is the last position of non tag end char.
 *  The `tagEnd` indicates whether the end of the tag has been reached.
 */
const indexOfSpaceOrTagEnd = (content, tagName, startPos, pos = 0) => {
  const len = content.length;
  let code, next;
  do {
    code = content.charCodeAt(pos);

    if (code === tagEndCode || (code === slashCode && content.charCodeAt(pos + 1) === tagEndCode)) {
      return { pos, tagEnd: true };
    }

    next = valueSeparatorCodes.indexOf(code) < 0;
    if (next) {
      pos++;
    }

    if (pos > len) {
      throw new Error(`The '${tagName}' tag starting at ${startPos} position is missing the closing '>' char.`);
    }
  } while (next);

  return { pos, tagEnd: false };
};

/**
 * @param {string} content
 * @param {string} tagName Used for exception only.
 * @param {number} startPos Used for exception only.
 * @param {number} pos
 * @return {number}
 */
const indexOfNonSpaceOrTagEnd = (content, tagName, startPos, pos = 0) => {
  const len = content.length;
  let code, next;
  do {
    code = content.charCodeAt(pos);

    if (code === tagEndCode || (code === slashCode && content.charCodeAt(pos + 1) === tagEndCode)) {
      return -1;
    }

    if (pos > len || code === tagStartCode) {
      throw new Error(`The '${tagName}' tag starting at ${startPos} position is missing the closing '>' char.`);
    }

    next = spaceCodes.indexOf(code) > -1;
    if (next) {
      pos++;
    }
  } while (next);

  return pos;
};

/**
 * Whether the link tag load a style or other assets.
 *
 * <link href="style.css" type="text/css" />
 * <link href="style.css" rel="stylesheet" />
 * <link href="style.css" rel="alternate stylesheet" />
 * <link href="style.css" rel="preload" as="style" />
 * <link href="style.css" rel="preload" as="stylesheet" />
 *
 * @param {{}} attrs The tag attributes.
 * @return {boolean}
 */
const isLinkStyle = (attrs) => {
  if (attrs?.type === 'text/css') return true;
  if (attrs?.as?.indexOf('style') > -1) return true;
  if (attrs?.rel?.indexOf('style') > -1) return true;

  return false;
};

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
 * @param {{}} attrs The tag attributes.
 * @return {boolean}
 */
const isLinkScript = (attrs) => {
  if (attrs?.as === 'script') return true;
  if (attrs?.rel === 'modulepreload') {
    return !attrs?.as || /(worker|serviceworker|sharedworker)/.test(attrs.as);
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
  static parseTag(content, { tag, attributes: attrList, filter, resourcePath = '' }) {
    const open = `<${tag}`;
    const offset = open.length;
    const result = [];
    let pos = 0;

    // detect all attributes in the tag
    // <tag{space|>}attr{space|=|>}{space}{quote}value{quote}{space|>}...
    while ((pos = content.indexOf(open, pos)) >= 0) {
      const { attrs, attrsData, startPos, endPos } = this.parseTagAttributes(content, tag, pos, offset);
      const raw = content.slice(startPos, endPos);
      const parsedAttrs = [];
      let type = 'asset';

      if (tag === 'script') {
        type = 'script';
      } else if (tag === 'link') {
        if (isLinkStyle(attrs)) type = 'style';
        else if (isLinkScript(attrs)) type = 'script';
      }

      for (let attrName of attrList) {
        if (!(attrName in attrs)) continue;

        const attrValue = attrs[attrName];
        const attrData = attrsData[attrName];
        const parsedAttr = this.parseAttributeValue(attrName, attrValue, attrData);
        let res = true;

        if (filter) {
          const { parsedValue } = parsedAttr;
          res =
            filter({ tag, attribute: attrName, value: attrValue, parsedValue, attributes: attrs, resourcePath }) !==
            false;
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
        type,
        tag,
        raw,
        parsedAttrs,
        attrs,
        startPos,
        endPos,
      });

      pos = endPos;
    }

    return result;
  }

  /**
   * Parse all tag attributes in the content.
   *
   * Note: allow zero or more spaces around `=`.
   * https://www.w3.org/TR/2011/WD-html5-20110113/syntax.html#attributes-0
   *
   * @param {string} content The string contains html.
   * @param {string} tagName The tag name.
   * @param {number} pos The starting tag position in the content.
   * @param {number} offset The offset of the first attribute in the tag.
   * @return {{attrs: {}, attrsData: {}, startPos: number, endPos: number}}
   */
  static parseTagAttributes(content, tagName, pos, offset = 0) {
    let attrs = {};
    let attrsData = {};
    let startPos = pos;
    let endPos = pos;
    let isTagEnd = false;

    pos += offset;

    while (!isTagEnd && (pos = indexOfNonSpaceOrTagEnd(content, tagName, startPos, pos)) > -1) {
      let { pos: attrEndPos, tagEnd } = indexOfSpaceOrTagEnd(content, tagName, startPos, pos);
      let attrStartPos = pos;
      let attrName = content.substring(attrStartPos, attrEndPos);
      let value = undefined;

      if (tagEnd) {
        // `<img disabled>`
        attrs[attrName] = value;
        break;
      }

      // next position should be the separator `=`
      pos = indexOfNonSpace(content, attrEndPos);
      endPos = pos;

      let hasValue = content.charCodeAt(pos) === equalCode;

      if (hasValue) {
        // allow a space around equal, e.g., `attr =  value`
        const initialValueStartPos = indexOfNonSpace(content, pos + 1);
        let valueStartPos = initialValueStartPos;
        let valueEndPos = -1;
        let nextCharCode = content.charCodeAt(valueStartPos);
        let isEscaped = false;

        if (nextCharCode === escapeCode) {
          isEscaped = true;
          nextCharCode = content.charCodeAt(++valueStartPos);
        }

        if (quotCodes.indexOf(nextCharCode) >= 0) {
          // value with quotes
          let quote = String.fromCharCode(nextCharCode);
          if (isEscaped) quote = `\\` + quote;

          valueEndPos = content.indexOf(quote, ++valueStartPos);
          if (valueEndPos > -1) {
            pos = valueEndPos + 1;
            isEscaped && pos++;
          }
          if (valueEndPos < 0) {
            throw new Error(
              `The '${tagName}' '${attrName}' attribute, starting at ${initialValueStartPos} position, is missing a closing quote:\n${content.slice(startPos)}`
            );
          }
        } else {
          // value w/o quotes
          let { pos: valueEndPos2, tagEnd } = indexOfSpaceOrTagEnd(content, tagName, startPos, valueStartPos);
          isTagEnd = tagEnd;
          valueEndPos = valueEndPos2;
          pos = valueEndPos;
        }

        value = content.slice(valueStartPos, valueEndPos);
        endPos = valueEndPos;

        attrsData[attrName] = {
          valueStartPos,
          valueEndPos,
          isEscaped,
        };
      }

      attrs[attrName] = value;
    }

    // find the tag end pos
    endPos = content.indexOf('>', endPos) + 1;

    return {
      attrs,
      attrsData,
      startPos,
      endPos,
    };
  }

  /**
   * Parse the value of the attribute.
   *
   * @param {string} attr The attribute name.
   * @param {string} value The value to parse files.
   * @param {{}} attrData The parsed info of the attribute.
   * @return {{attr: string, attrs?: Array, value: string, parsedValue: Array<string>, startPos: number, endPos: number, offset: number, inEscapedDoubleQuotes: boolean} | {} | boolean}
   */
  static parseAttributeValue(attr, value, attrData) {
    // Note:
    // 1. The HTML string contains the normal quote:
    //    <img src="image.png">
    //    the require function should be injected as:
    //    module.exports = '<img src="' + require('image.png') + '">'

    // 2. The template function can contain the escaped quote, e.g.:
    //    fn("<img src=\"image.png\">")
    //    the require function should be injected as:
    //    module.exports = fn("<img src=\"" + require('image.png') + "\">")

    let inEscapedDoubleQuotes = attrData.isEscaped;
    let result = {
      attr,
      value,
      startPos: attrData.valueStartPos,
      endPos: attrData.valueEndPos,
      inEscapedDoubleQuotes,
    };

    if (attr.indexOf('srcset') > -1) {
      const { values, attrs } = this.parseSrcsetValue(value, attrData.valueStartPos, inEscapedDoubleQuotes);

      result.parsedValue = values;
      result.attrs = attrs;

      return result;
    }

    if (attr === 'style') {
      const { values, attrs } = this.parseStyleUrlValues(value, attrData.valueStartPos);

      if (!values) {
        return {};
      }

      result.parsedValue = values;
      result.attrs = attrs;

      return result;
    }

    // parse for required values which are not yet resolved by a preprocessor like pug
    if (value.indexOf('\\u0027') < 0 && value.indexOf('require(') > 0) {
      const { values, attrs } = this.parseRequiredValues(value, attrData.valueStartPos);

      return { ...result, parsedValue: values, attrs };
    }

    result.parsedValue = [value.split('?', 1)[0]];

    return result;
  }

  /**
   * Parse url() in the style attribute.
   *
   * For example:
   *   <div style="background-image: url(./image.png);"></div>
   *
   * @param {string} content The attribute value.
   * @param {Number} valueOffset The absolute offset of value in the raw content.
   * @return {{values: *[], attrs: *[]} | {}}
   */
  static parseStyleUrlValues(content, valueOffset) {
    let pos = content.indexOf('url(');

    if (pos < 0) return {};

    let valueStartPos = pos + 4;
    let valueEndPos = content.indexOf(')', valueStartPos);
    let quote = content.charAt(valueStartPos);
    let skipQuotes = 1;

    if (quote !== '"' && quote !== "'") {
      quote = '';
      skipQuotes = 0;
    }

    let parsedValue = content.slice(valueStartPos + skipQuotes, valueEndPos - skipQuotes); // skip quotes around value

    let attrs = {
      value: parsedValue,
      quote,
      startPos: valueOffset + valueStartPos,
      endPos: valueOffset + valueEndPos,
    };

    return { values: [parsedValue], attrs: [attrs] };
  }

  /**
   * Parse require() in the attribute value.
   *
   * For example:
   *   <a href="#" data-picture='{ "alt":"picture", "imgSrc": require("./picture.png") }'></a>
   *
   * @param {string} content The attribute value.
   * @param {Number} valueOffset The absolute offset of value in the raw content.
   * @return {{values: *[], attrs: *[]}}
   */
  static parseRequiredValues(content, valueOffset) {
    let pos;
    let values = [];
    let attrs = [];

    while ((pos = content.indexOf('require(', pos)) > -1) {
      let valueStartPos = pos + 8;
      let valueEndPos = content.indexOf(')', valueStartPos);
      let quote = content.charAt(valueStartPos);
      let value = content.slice(valueStartPos + 1, valueEndPos - 1); // skip quotes around value

      values.push(value.split('?', 1)[0]);

      attrs.push({
        value,
        quote, // quotes used in require()
        startPos: valueOffset + pos, // skip `require(`
        endPos: valueOffset + valueEndPos + 1, // skip `)`
      });

      pos = valueEndPos + 1;
    }

    return { values, attrs };
  }

  /**
   * Parse srcset attribute.
   *
   * Possible values:
   *   "img1.png"
   *   "img1.png, img2.png 100w, img3.png 1.5x"
   *
   * @param {string} content The srcset value.
   * @param {Number} valueOffset The absolute offset of value in the raw content.
   * @param {boolean} inEscapedDoubleQuotes Bypass the property to all `attrs` objects.
   * @return {{values: *[], attrs: *[]}}
   */
  static parseSrcsetValue(content, valueOffset, inEscapedDoubleQuotes) {
    const lastPos = content.length;
    let startPos = 0;
    let endPos = 0;
    let currentPos;
    let values = [];
    let attrs = [];

    // supports the query for 'responsive-loader' in following notations:
    // - image.png?{sizes: [100,200,300], format: 'jpg'} // JSON5
    // - require('image.png?sizes[]=100,sizes[]=200,sizes[]=300,format=jpg') // `,` as parameter separator in require(), used in pug
    if (content.indexOf('?{') > 0 || content.indexOf('require(') > -1) {
      return {
        values: [content],
        attrs: [{ attr: 'srcset', value: content, startPos: valueOffset, endPos: valueOffset + lastPos }],
      };
    }

    do {
      currentPos = content.indexOf(',', startPos);
      if (currentPos < 0) {
        currentPos = lastPos;
      }

      startPos = indexOfNonSpace(content, startPos);

      // parse value like "img.png"
      let value = content.slice(startPos, currentPos);
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
        attr: 'srcset',
        value,
        startPos: valueOffset + startPos,
        endPos: valueOffset + endPos,
        inEscapedDoubleQuotes,
      });

      startPos = currentPos + 1;
    } while (currentPos < lastPos);

    return { values, attrs };
  }
}

module.exports = { HtmlParser, comparePos };
