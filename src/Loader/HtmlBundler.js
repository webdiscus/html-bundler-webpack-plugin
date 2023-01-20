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
    const result = this.normalizeTagsList(tags);
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
   * Ignore:
   *  - https://example.com/style.css
   *  - http://example.com/style.css
   *  - //style.css
   *  - /style.css
   *  - javascript:alert('hello')
   *
   * @param {string} type The type of source: 'style', 'script', 'asset'.
   * @param {string} file The source file of resource.
   * @param {string} issuer The issuer of source file.
   * @return {string|boolean} Return resolved full path of source file or false
   */
  static resolve({ type, file, issuer }) {
    if (/^(?:https?:)?(?:\/{1,2})/.test(file) || file.startsWith('javascript:')) {
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
  static normalizeTagsList(tags) {
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
   * Note: following outdated tags will be not supported
   * - <embed type="image/jpg" src="..."> => better to use the <img src="...">
   * - <embed type="video/webm" src="..."> => better to use the <video src="...">
   * - <embed type="audio/mpeg" src="..."> => better to use the <audio src="...">
   *
   * @param {string} content
   * @return {Array<{}>}
   */
  static parseTags(content) {
    const tagsList = [
      { tag: 'link', attrs: ['href', 'imagesrcset'] }, // `imagesrcset` is for rel="preload" and as="image" only
      { tag: 'script', attrs: ['src'] },
      { tag: 'img', attrs: ['src', 'srcset'] },
      { tag: 'input', attrs: ['src'] }, // type="image"
      { tag: 'source', attrs: ['src', 'srcset'] },
      { tag: 'audio', attrs: ['src'] },
      { tag: 'track', attrs: ['src'] },
      { tag: 'video', attrs: ['src', 'poster'] },
      // { tag: 'object', attrs: ['data'] }, // reserved for the future
    ];

    let result = [];
    for (let item of tagsList) {
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
   * @param {string} tag
   * @param {string | Array<string>} attrs
   * @return {Array<{}> | boolean}
   */
  static parseTag(content, { tag, attrs = [] }) {
    const open = `<${tag} `;
    const close = '>';
    let startPos = 0;
    let endPos = 0;

    let result = [];

    while ((startPos = content.indexOf(open, startPos)) >= 0) {
      let attrValues = [];
      endPos = content.indexOf(close, startPos) + close.length;

      if (endPos < 1) {
        throw new Error(`The '${tag}' tag hasn't the close '>' char.`);
      }

      const source = content.slice(startPos, endPos);
      let type = 'asset';

      if (tag === 'script') {
        type = 'script';
      } else if (tag === 'link' && this.isStyle(source)) {
        type = 'style';
      }

      for (let attr of attrs) {
        let value = attr === 'srcset' ? this.parseSrcset(source) : this.parseAttr(source, attr);
        value !== false && attrValues.push(value);
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
   * @param {string} source The source code of an HTML tag.
   * @param {string} attr The attribute to parse value.
   * @return {{attr: string, value: string, startPos: number, endPos: number}|boolean}
   */
  static parseAttr(source, attr) {
    const open = `${attr}="`;
    let startPos = source.indexOf(open);

    if (startPos < 0) return false;

    startPos += open.length;

    const endPos = source.indexOf('"', startPos);
    const value = source.slice(startPos, endPos);

    return { attr, value, startPos, endPos };
  }

  /**
   * @param {string} source The source code of an HTML tag.
   * @return {{attr: string, value: Array<{}>, startPos: number, endPos: number}|boolean}
   */
  static parseSrcset(source) {
    const attr = 'srcset';
    const open = `${attr}="`;
    let startPos = source.indexOf(open);

    if (startPos < 0) return false;

    startPos += open.length;

    const endPos = source.indexOf('"', startPos);
    const srcset = source.slice(startPos, endPos);
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
   * <link href="style.css" type="text/css" />            => true
   * <link href="style.css" rel="alternate stylesheet" /> => true
   *
   * @param {string} tag The tag with attributes.
   * @return {boolean}
   */
  static isStyle(tag) {
    return /rel=".*stylesheet.*"/.test(tag) || /type="text\/css"/.test(tag);
  }
}

module.exports = HtmlBundler;
