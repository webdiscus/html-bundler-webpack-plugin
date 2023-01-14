const Loader = require('./Loader');
const { isWin, isInline, pathToPosix } = require('./Utils');

const comparePos = (a, b) => a.startPos - b.startPos;

class HtmlBundler {
  /**
   * Resolve all source resource in HTML.
   *
   * @param {string} html The source HTML string.
   * @param {string} issuer The absolute filename.
   * @return {string}
   */
  static compile(html, issuer) {
    const tags = this.parseTags(html);
    const result = this.optimizeParsedTags(tags);
    let output = '';
    let pos = 0;

    if (isWin) issuer = pathToPosix(issuer);

    for (let { type, file, startPos, endPos } of result) {
      const resolvedFile = this.resolve({ type, file, issuer });
      // skip not resolved value, e.g. URL
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
   *
   * Ignore URLs:
   *  - https://example.com/style.css
   *  - http://example.com/style.css
   *  - //style.css
   *  - /style.css
   *
   * @param {string} type The type of source: 'style', 'script', 'asset'.
   * @param {string} file The source file of resource.
   * @param {string} issuer The issuer of source file.
   * @return {string|boolean} Return resolved full path of source file or false
   */
  static resolve({ type, file, issuer }) {
    if (/^(?:https?:)?(?:\/{1,2})/.test(file)) {
      return false;
    }

    let resolvedFile;

    switch (type) {
      case 'style':
      case 'inline/style':
        resolvedFile = Loader.compiler.loaderRequireStyle(file, issuer);
        break;
      case 'script':
      case 'inline/script':
        resolvedFile = Loader.compiler.loaderRequireScript(file, issuer);
        break;
      default:
        resolvedFile = Loader.compiler.loaderRequire(file, issuer);
        break;
    }

    return resolvedFile;
  }

  /**
   * Transform a deep nested structure of parsed values to a flat one.
   *
   * TODO: optimize the parsing to save data directly in flat structure.
   *
   * @param {Array<{}>} tags
   * @return {Array<{}>}
   */
  static optimizeParsedTags(tags) {
    const result = [];

    for (let { type, startPos: tagStartPos, endPos: tagEndPos, attrs } of tags) {
      for (let { startPos: attrStartOffset, endPos: attrEndOffset, value } of attrs) {
        const attrStartPos = tagStartPos + attrStartOffset;

        if (Array.isArray(value)) {
          for (let { startPos: valueStartOffset, endPos: valueEndOffset, value: attrValue } of value) {
            result.push({
              type,
              file: attrValue,
              startPos: attrStartPos + valueStartOffset,
              endPos: attrStartPos + valueEndOffset,
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
   * @param {string} content
   * @return {Array<{}>}
   */
  static parseTags(content) {
    const links = this.parseTag(content, { tagName: 'link', attrs: ['href'] });
    const scripts = this.parseTag(content, { tagName: 'script', attrs: ['src'] });
    const images = this.parseTag(content, { tagName: 'img', attrs: ['src', 'srcset'] });
    const sourceImages = this.parseTag(content, { tagName: 'source', attrs: ['srcset'] });

    return [...links, ...scripts, ...images, ...sourceImages].sort(comparePos);
  }

  /**
   * Parse values of tag attributes.
   *
   * Following assets can be parsed:
   *
   * <script src="./main.js" />
   * <link href="./style.css" rel="stylesheet" />
   * <link href="./basic.css" rel="alternate stylesheet" />
   * <link href="./favicon.ico" rel="icon" />
   * <link href="./my-font.woff2" rel="preload" as="font" type="font/woff2" />
   *
   * <img src="./img1.png" alt="apple">
   * <img src="./img1.png" srcset="./img1.png, ./img2.png 100w, ./img3.png 1.5x">
   * <source srcset="./img1.png, ./img2.png 100w, ./img3.png 1.5x">
   * <source srcset="./photo.webp" type="image/webp" />
   *
   * Note: don't parse resource in style, like <div style="background-image: url(image.png)">.
   *
   * @param {string} content
   * @param {string} tagName
   * @param {string | Array<string>} attrs
   * @return {Array<{}> | boolean}
   */
  static parseTag(content, { tagName, attrs = [] }) {
    const open = `<${tagName} `;
    const close = '>';
    let startPos = 0;
    let endPos = 0;

    let result = [];

    while ((startPos = content.indexOf(open, startPos)) >= 0) {
      let attrValues = [];
      endPos = content.indexOf(close, startPos) + close.length;
      if (endPos < 1) throw new Error(`The '${tagName}' tag hasn't the close '>' char.`);

      const tagSource = content.slice(startPos, endPos);
      let type = 'asset';

      if (tagName === 'script') {
        type = 'script';
      } else if (tagName === 'link' && this.isStyle(tagSource)) {
        type = 'style';
      }

      for (let attr of attrs) {
        let value = attr === 'srcset' ? this.parseSrcset(tagSource) : this.parseAttr(tagSource, attr);
        value !== false && attrValues.push(value);
      }

      // sort attributes by pos
      if (attrValues.length > 1) {
        attrValues.sort(comparePos);
      }

      result.push({
        tagName,
        tagSource,
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
   * @param {string} tagSource The source code of an HTML tag.
   * @param {string} attr The attribute to parse value.
   * @return {{attr: string, value: string, startPos: number, endPos: number}|boolean}
   */
  static parseAttr(tagSource, attr) {
    const open = `${attr}="`;
    let startPos = tagSource.indexOf(open);

    if (startPos < 0) return false;

    startPos += open.length;

    const endPos = tagSource.indexOf('"', startPos);
    const value = tagSource.slice(startPos, endPos);

    return { attr, value, startPos, endPos };
  }

  /**
   * @param {string} tagSource The source code of an HTML tag.
   * @return {{attr: string, value: Array<{}>, startPos: number, endPos: number}|boolean}
   */
  static parseSrcset(tagSource) {
    const attr = 'srcset';
    const open = `${attr}="`;
    let startPos = tagSource.indexOf(open);

    if (startPos < 0) return false;

    startPos += open.length;

    const endPos = tagSource.indexOf('"', startPos);
    const srcset = tagSource.slice(startPos, endPos);
    const value = this.parseSrcsetValue(srcset);

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

    do {
      currentPos = srcsetValue.indexOf(',', startPos);
      if (currentPos < 0) {
        currentPos = lastPos;
      }

      // find index of next non-space char when value is like " img.png 100w"
      for (; srcsetValue.charAt(startPos) === ' '; startPos++) {}

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

  /**
   * Whether link tag load a style or other assets.
   *
   * <link href="style.css" rel="stylesheet" />           => true
   * <link href="basic.css" rel="alternate stylesheet" /> => true
   * <link href="favicon.ico" rel="icon"  />              => false
   * <link href="myFont.woff2" rel="preload" />           => false
   *
   * @param {string} tag The tag with attributes.
   * @return {boolean}
   */
  static isStyle(tag) {
    return /rel=".*stylesheet.*"/.test(tag);
  }
}

module.exports = HtmlBundler;
