const { HtmlParser, comparePos } = require('../Common/HtmlParser');
const { isUrl } = require('../Common/Helpers');

class Template {
  /**
   * Resolve all source resources in HTML.
   *
   * @param {string} content The HTML string.
   * @param {string} issuer The template file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @param {HtmlBundlerPlugin.Hooks} hooks The plugin hooks.
   * @param {Loader|null} loader
   * @return {string}
   */
  static resolve({ content, issuer, entryId, hooks, loader }) {
    const loaderOption = loader.loaderOption;
    const sources = loaderOption.getSources();

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
    const isBasedir = loaderOption.getBasedir() !== false;
    let output = '';
    let pos = 0;

    for (let { type, tag, raw, parsedAttrs } of parsedTags) {
      for (let { attr, value, resolvedValue, startPos, endPos, quote, inEscapedDoubleQuotes } of parsedAttrs) {
        if (resolvedValue == null) {
          if (!value) continue;

          const result = this.resolveFile({
            loader,
            isBasedir,
            type,
            value,
            issuer,
            entryId,
            inEscapedDoubleQuotes,
          });

          // skip not resolvable value, e.g., URL
          if (!result) continue;

          const { resolvedFile, requireExpression } = result;
          const hookResult = hooks.resolveSource.call(raw, {
            type,
            tag,
            attribute: attr,
            value,
            resolvedFile,
            issuer,
            inEscapedDoubleQuotes,
          });

          // note: if the hook returns `undefined`, then the hookResult contains the value of the first argument
          resolvedValue = hookResult && hookResult !== raw ? hookResult : requireExpression;
        }

        // enclose the value in quotes
        if (!quote) quote = '';

        output += content.slice(pos, startPos) + quote + resolvedValue + quote;
        pos = endPos;
      }
    }

    return output + content.slice(pos);
  }

  /**
   * Resolve source file.
   *
   * Resolve relative path: href="./basic.css", href="../basic.css"
   * Resolve alias: href="@styles/basic.css", href="~Styles/basic.css", href="Styles/basic.css"
   * Resolve file with a query: srcset="image.png?{sizes: [100,200,300], format: 'jpg'}"
   *
   * If the `loader.root` option is not false, then resolve a file with leading `/`: `/img/logo.png`
   *
   * Ignore:
   *  - https://example.com/style.css
   *  - http://example.com/style.css
   *  - whatsapp://send?id=1234567890&text=Hello
   *  - //style.css
   *  - /style.css (ignore only if `loader.root` is false)
   *  - javascript:alert('hello')
   *  - data:image/png
   *  - mailto:admin@test.com
   *  - `\\u0027 + require(\\u0027/resolved/path/to/file.ext\\u0027) + \\u0027` // an expression of resolved file via a template engine
   *
   *  Allow special cases when value contains `:`
   *  - C:\path\to\file.ext
   *  - image.png?{size:600}
   *
   * @param {Loader} loader The Loader instance.
   * @param {boolean} isBasedir Whether is used the `root` option.
   * @param {string} type The type of source: 'style', 'script', 'asset'.
   * @param {string} value The attribute value to resolve as an absolute file path.
   * @param {string} issuer The issuer of source file.
   * @param {string|number} entryId The entry id where is loaded the resource.
   * @param {boolean} inEscapedDoubleQuotes Whether the resolving value is enclosed with escaped double quotes.
   * @return {{requireExpression: string, resolvedFile: string}|boolean} Return a resolved full path of source file or false.
   */
  static resolveFile({ loader, isBasedir, type, value, issuer, entryId, inEscapedDoubleQuotes }) {
    value = value.trim();

    if (
      (!isBasedir && value.startsWith('/')) ||
      isUrl(value) ||
      value.startsWith('#') ||
      value.startsWith('\\u0027') ||
      (value.includes(':') && !value.includes(':\\') && !value.includes('?{'))
    ) {
      return false;
    }

    const loaderCompiler = loader.getCompiler();
    const enclosingQuotes = inEscapedDoubleQuotes ? '"' : "'";
    loaderCompiler.setEnclosingQuotes(enclosingQuotes);

    switch (type) {
      case 'style':
        return loaderCompiler.requireStyle(value, issuer, entryId);
      case 'script':
        return loaderCompiler.requireScript(value, issuer, entryId);
    }

    return loaderCompiler.requireFile(value, issuer, entryId);
  }
}

module.exports = Template;
