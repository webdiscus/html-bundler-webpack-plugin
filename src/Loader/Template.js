const Loader = require('./Loader');
const Options = require('./Options');
const { HtmlParser, comparePos } = require('../Common/HtmlParser');

class Template {
  /**
   * Resolve all source resources in HTML.
   *
   * @param {string} content The HTML string.
   * @param {string} issuer The template file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @return {string}
   */

  static compile(content, issuer, entryId) {
    const sources = Options.getSources();

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
    const isBasedir = Options.getBasedir() !== false;
    let output = '';
    let pos = 0;

    for (let { type, attrs } of parsedTags) {
      for (let { startPos, endPos, value: file, offset } of attrs) {
        const resolvedFile = this.resolve({ isBasedir, type, file, issuer, entryId });
        // skip not resolvable value, e.g. URL
        if (!resolvedFile) continue;

        output += content.slice(pos, startPos + offset) + resolvedFile;
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
   * @param {string} file The source file of resource.
   * @param {string} issuer The issuer of source file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @return {string|boolean} Return a resolved full path of source file or false.
   */
  static resolve({ isBasedir, type, file, issuer, entryId }) {
    file = file.trim();

    if (
      (!isBasedir && file.startsWith('/')) ||
      file.startsWith('//') ||
      file.startsWith('#') ||
      (file.indexOf(':') > 0 && file.indexOf('?{') < 0)
    ) {
      return false;
    }

    switch (type) {
      case 'style':
        return Loader.compiler.loaderRequireStyle(file, issuer, entryId);
      case 'script':
        return Loader.compiler.loaderRequireScript(file, issuer, entryId);
    }

    return Loader.compiler.loaderRequire(file, issuer, entryId);
  }
}

module.exports = Template;
