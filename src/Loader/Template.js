const Loader = require('./Loader');
const Option = require('./Option');
const { HtmlParser, comparePos } = require('../Common/HtmlParser');

class Template {
  /**
   * Resolve all source resources in HTML.
   *
   * @param {string} content The HTML string.
   * @param {string} issuer The template file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @param { HtmlBundlerPlugin.Hooks} hooks The plugin hooks.
   * @return {string}
   */

  static resolve(content, issuer, entryId, hooks) {
    const sources = Option.getSources();

    if (sources === false) {
      return content;
    }

    // parse all tags containing resources
    let parsedTags = [];
    for (let opts of sources) {
      opts.resourcePath = issuer;
      parsedTags.push(...HtmlParser.parseTag(content, opts));
    }
    parsedTags = parsedTags.sort(comparePos);

    // resolve resources in html
    const isBasedir = Option.getBasedir() !== false;
    let output = '';
    let pos = 0;

    for (let { tag, source, parsedAttrs } of parsedTags) {
      for (let { type, attr, startPos, endPos, value, offset } of parsedAttrs) {
        const result = this.resolveFile({ isBasedir, type, value, issuer, entryId });

        // skip not resolvable value, e.g., URL
        if (!result) continue;

        const { resolvedFile, encodedRequire } = result;
        const hookResult = hooks.resolveSource.call(source, {
          type,
          tag,
          attribute: attr,
          value,
          resolvedFile,
          issuer,
        });

        // note: if the hook returns `undefined` then the hookResult contains the value of the first argument
        const resolvedValue = hookResult && hookResult !== source ? hookResult : encodedRequire;

        output += content.slice(pos, startPos + offset) + resolvedValue;
        pos = endPos + offset;
      }
    }

    return output + content.slice(pos);
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
   * @param {boolean} isBasedir Whether is used the `root` option.
   * @param {string} type The type of source: 'style', 'script', 'asset'.
   * @param {string} value The attribute value to resolve as an absolute file path.
   * @param {string} issuer The issuer of source file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @return {{encodedRequire: string, resolvedFile: string}|boolean} Return a resolved full path of source file or false.
   */
  static resolveFile({ isBasedir, type, value, issuer, entryId }) {
    value = value.trim();

    if (
      (!isBasedir && value.startsWith('/')) ||
      value.startsWith('//') ||
      value.startsWith('#') ||
      (value.indexOf(':') > 0 && value.indexOf('?{') < 0)
    ) {
      return false;
    }

    switch (type) {
      case 'style':
        return Loader.compiler.loaderRequireStyle(value, issuer, entryId);
      case 'script':
        return Loader.compiler.loaderRequireScript(value, issuer, entryId);
    }

    return Loader.compiler.loaderRequire(value, issuer, entryId);
  }
}

module.exports = Template;
