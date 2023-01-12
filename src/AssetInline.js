const path = require('path');
const { isWin } = require('./Utils');

/**
 * Parse tag attributes in a string.
 *
 * @param {string} string
 * @param {Array<string>} exclude The list of excluded attributes from result.
 * @returns {Object<key: string, value: string>} The parsed attributes as object key:value.
 */
const parseAttributes = (string, exclude = []) => {
  let attrPaars = string.replace(/\n/g, ' ').split('=');
  let keys = [];
  let values = [];
  let attrs = {};

  for (let str of attrPaars) {
    let quoteStartPos = str.indexOf('"');
    let quoteEndPos = str.lastIndexOf('"');

    if (quoteStartPos < 0) {
      keys.push(str.trim());
    } else {
      let value = str.slice(quoteStartPos + 1, quoteEndPos).trim();
      let key = str.slice(quoteEndPos + 1).trim();
      if (value) values.push(value);
      if (key) keys.push(key);
    }
  }

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let value = values[i];

    if (value !== '' && !exclude.find((item) => key.startsWith(item))) {
      attrs[key] = value;
    }
  }

  return attrs;
};

class AssetInline {
  static data = new Map();
  static inlineSvgIssueAssets = new Set();

  /**
   * Whether the request is data-URL.
   *
   * @param {string} request The request of asset.
   * @returns {boolean}
   */
  static isDataUrl(request) {
    return request.startsWith('data:');
  }

  /**
   * @param {string} sourceFile
   * @param {string} issuer
   * @returns {boolean}
   */
  static isInlineSvg(sourceFile, issuer) {
    const item = this.data.get(sourceFile);
    return item != null && item.cache != null && item.inlineSvg && item.inlineSvg.issuers.has(issuer);
  }

  /**
   * @param {string} request
   * @return {boolean}
   */
  static isSvgFile(request) {
    const [file] = request.split('?', 1);
    return file.endsWith('.svg');
  }

  /**
   * @param {string} sourceFile
   * @param {string} issuer
   * @returns {string|null}
   */
  static getDataUrl(sourceFile, issuer) {
    if (isWin) sourceFile = path.win32.normalize(sourceFile);
    const item = this.data.get(sourceFile);

    return item != null && item.cache != null && item.dataUrl.issuers.has(issuer) ? item.cache.dataUrl : null;
  }

  /**
   * @param {string} sourceFile The source filename of asset.
   * @param {string} issuer The output filename of the issuer.
   * @param {boolean} isEntry Whether the issuer is an entry file.
   */
  static add(sourceFile, issuer, isEntry) {
    if (!this.data.has(sourceFile)) {
      this.data.set(sourceFile, {
        cache: null,
      });
    }
    const item = this.data.get(sourceFile);

    if (isEntry && this.isSvgFile(sourceFile)) {
      // SVG can only be inlined in HTML, in CSS it's a data URL
      if (!item.inlineSvg) {
        item.inlineSvg = {
          issuers: new Set(),
          assets: new Set(),
        };
      }
      item.inlineSvg.issuers.add(issuer);
    } else {
      if (!item.dataUrl) {
        item.dataUrl = {
          issuers: new Set(),
        };
      }
      item.dataUrl.issuers.add(issuer);
    }
  }

  /**
   * @param {Chunk} chunk The Webpack chunk.
   * @param {Module} module The Webpack module.
   * @param {CodeGenerationResults|Object} codeGenerationResults Code generation results of resource modules.
   * @param {string} issuerAssetFile The output filename of issuer.
   */
  static render({ module, chunk, codeGenerationResults, issuerAssetFile }) {
    const sourceFile = module.resource;
    const item = this.data.get(sourceFile);

    if (!item) return;

    if (this.isSvgFile(sourceFile)) {
      // extract SVG content from processed source via a loader like svgo-loader
      const svg = module.originalSource().source().toString();

      // svg is inline in html only, in css is as data URL
      if (item.inlineSvg) {
        item.inlineSvg.assets.add(issuerAssetFile);
        this.inlineSvgIssueAssets.add(issuerAssetFile);
      }

      if (item.cache == null) {
        item.cache = this.parseSvg(svg);
      }
    } else if (item.cache == null) {
      // data URL for binary resource
      const dataUrl = codeGenerationResults.getData(module, chunk.runtime, 'url').toString();
      item.cache = { dataUrl };
    }
  }

  /**
   * @param {string} svg The SVG content.
   * @return {{dataUrl: string, svgAttrs: Object<key:string, value:string>, innerSVG: string}}
   */
  static parseSvg(svg) {
    const svgOpenTag = '<svg';
    const svgCloseTag = '</svg>';
    const svgOpenTagStartPos = svg.indexOf(svgOpenTag);
    const svgCloseTagPos = svg.indexOf(svgCloseTag, svgOpenTagStartPos);

    if (svgOpenTagStartPos > 0) {
      // extract SVG content only, ignore xml tag and comments before SVG tag
      svg = svg.slice(svgOpenTagStartPos, svgCloseTagPos + svgCloseTag.length);
    }

    // parse SVG attributes and extract inner content of SVG
    const svgAttrsStartPos = svgOpenTag.length;
    const svgAttrsEndPos = svg.indexOf('>', svgAttrsStartPos);
    const svgAttrsString = svg.slice(svgAttrsStartPos, svgAttrsEndPos);
    const svgAttrs = parseAttributes(svgAttrsString, ['id', 'version', 'xml', 'xmlns']);
    const innerSVG = svg.slice(svgAttrsEndPos + 1, svgCloseTagPos - svgOpenTagStartPos);

    // encode reserved chars in data URL for IE 9-11 (enable if needed)
    //const reservedChars = /["#%{}<>]/g;
    // const charReplacements = {
    //   '"': "'",
    //   '#': '%23',
    //   '%': '%25',
    //   '{': '%7B',
    //   '}': '%7D',
    //   '<': '%3C',
    //   '>': '%3E',
    // };

    // encode reserved chars in data URL for modern browsers
    const reservedChars = /["#]/g;
    const charReplacements = {
      '"': "'",
      '#': '%23',
    };
    const replacer = (char) => charReplacements[char];
    // note: don't have to encode as base64, pure svg is smaller
    const dataUrl = 'data:image/svg+xml,' + svg.replace(/\s+/g, ' ').replace(reservedChars, replacer);

    return {
      svgAttrs,
      innerSVG,
      dataUrl,
    };
  }

  /**
   * Insert inline SVG in HTML.
   * Replacing a tag containing the svg source file with the svg element.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  static insertInlineSvg(compilation) {
    if (this.inlineSvgIssueAssets.size === 0) return;

    const RawSource = compilation.compiler.webpack.sources.RawSource;
    const NL = '\n';
    const excludeTags = ['link'];

    // resulting HTML files
    for (const assetFile of this.inlineSvgIssueAssets) {
      const asset = compilation.assets[assetFile];
      if (!asset) continue;

      let html = asset.source();

      // inline assets in HTML
      for (let [sourceFile, item] of this.data) {
        if (!item.inlineSvg || !item.inlineSvg.assets.has(assetFile)) continue;

        const [filename] = path.basename(sourceFile).split('?', 1);
        const cache = item.cache;

        // replace all asset tags with svg content
        // start replacing in body, ignore head
        let offset = html.indexOf('<body');
        let srcPos;
        while ((srcPos = html.indexOf(sourceFile, offset)) >= 0) {
          // find tag `<img src="sourceFile">` with inline asset
          let tagStartPos = srcPos;
          let tagEndPos = srcPos + sourceFile.length;
          while (tagStartPos >= 0 && html.charAt(--tagStartPos) !== '<') {}
          tagEndPos = html.indexOf('>', tagEndPos);

          // reserved feat: ignore replacing of a tag
          // const tag = html.slice(tagStartPos + 1, html.indexOf(' ', tagStartPos + 3));
          // if (excludeTags.indexOf(tag) >= 0) {
          //   offset = tagEndPos;
          //   continue;
          // }

          // parse image attributes
          let tagAttrsString = html.slice(html.indexOf(' ', tagStartPos), tagEndPos);
          let tagAttrs = parseAttributes(tagAttrsString);
          delete tagAttrs['src'];

          // merge svg attributes with tag attributes
          let attrs = Object.assign({}, cache.svgAttrs, tagAttrs);
          let attrsString = '';
          for (let key in attrs) {
            attrsString += ' ' + key + '="' + attrs[key] + '"';
          }

          const inlineSvg =
            NL + `<!-- inline: ${filename} -->` + NL + '<svg' + attrsString + '>' + cache.innerSVG + '</svg>' + NL;

          offset = tagStartPos + inlineSvg.length;
          html = html.slice(0, tagStartPos) + inlineSvg + html.slice(tagEndPos + 1);
        }
      }

      compilation.assets[assetFile] = new RawSource(html);
    }
  }
}

module.exports = AssetInline;
