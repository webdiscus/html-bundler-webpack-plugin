const Loader = require('./Loader');
const { isWin, isInline, pathToPosix } = require('./Utils');
const { indexOf } = require('nunjucks/src/lib');

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
 * Whether link tag load a style or other assets.
 *
 * <link href="style.css" type="text/css" />            => true
 * <link href="style.css" rel="alternate stylesheet" /> => true
 *
 * @param {string} tag The tag with attributes.
 * @return {boolean}
 */
const isStyle = (tag) => /rel=".*stylesheet.*"/.test(tag) || /type="text\/css"/.test(tag);

class HtmlBundler {
  static sources = [];

  /**
   * Resolve all source resource in HTML.
   *
   * @param {string} html The source HTML string.
   * @param {string} issuer The absolute filename.
   * @param {Array<object>} sources The list of sources tags and attributes.
   * @return {string}
   */
  static compile(html, issuer, sources) {
    this.sources = sources;
    this.issuer = issuer;

    const tags = this.parseTags(html);
    const result = this.normalizeTagsList(tags);
    let output = '';
    let pos = 0;

    if (isWin) issuer = pathToPosix(issuer);

    for (let { type, file, startPos, endPos } of result) {
      const resolvedFile = this.resolve({ type, file, issuer });
      // skip not resolvable value, e.g. URL
      if (!resolvedFile) continue;

      output += html.slice(pos, startPos);

      switch (type) {
        case 'inline/style':
          output += '<style>' + resolvedFile + '</style>';
          break;
        case 'inline/script':
          // note: the closing tag `</script>` is already present in the tail of the html
          output += '<script>' + resolvedFile;
          break;
        default:
          output += resolvedFile;
          break;
      }

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
   * Ignore:
   *  - https://example.com/style.css
   *  - http://example.com/style.css
   *  - //style.css
   *  - /style.css
   *  - javascript:alert('hello')
   *  - data:image/png
   *  - mailto:admin@test.com
   *
   * @param {string} type The type of source: 'style', 'script', 'asset'.
   * @param {string} file The source file of resource.
   * @param {string} issuer The issuer of source file.
   * @return {string|boolean} Return resolved full path of source file or false
   */
  static resolve({ type, file, issuer }) {
    file = file.trim();

    if (/^(?:\/{1,2})/.test(file) || file.startsWith('#') || (file.indexOf(':') > 0 && file.indexOf('?{') < 0)) {
      return false;
    }

    switch (type) {
      case 'style':
      case 'inline/style':
        return Loader.compiler.loaderRequireStyle(file, issuer);
      case 'script':
      case 'inline/script':
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
  static normalizeTagsList(tags) {
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

          if (['style', 'script'].indexOf(type) >= 0 && isInline(value)) {
            // cut the source tag completely to inject an inline `<script>` or `<style>` tag
            startPos = tagStartPos;
            endPos = tagEndPos;
            type = `inline/${type}`;
          }

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
      } else if (tag === 'link' && isStyle(source)) {
        type = 'style';
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

module.exports = HtmlBundler;
