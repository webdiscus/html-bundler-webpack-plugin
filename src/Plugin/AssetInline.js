/**
 * @param {{key: string, value: string}} attrs
 * @param {Array<string>} exclude The list of excluded attributes from the result.
 * @return {string}
 */
const attrsToString = (attrs, exclude = []) => {
  let res = '';
  for (const key in attrs) {
    if (exclude.indexOf(key) < 0) {
      res += ` ${key}="${attrs[key]}"`;
    }
  }

  return res;
};

/**
 * Parse tag attributes in a tag string.
 *
 * @param {string} string
 * @returns {Object<key: string, value: string>} The parsed attributes as the object key:value.
 */
const parseAttributes = (string) => {
  let attrs = {};
  const matches = string.matchAll(/(\S+)="(.+?)"/gm);
  for (const [, key, val] of matches) {
    attrs[key] = val;
  }

  return attrs;
};

/**
 * Parse values in HTML.
 *
 * @param {string} content The HTML content.
 * @param {string} value The value to parse.
 * @return {Array<{value: string, attrs: {}, tagStartPos: number, tagEndPos: number, valueStartPos: number, valueEndPos: number}>}
 */
const parseValues = (content, value) => {
  const valueLen = value.length;
  let valueStartPos = 0;
  let valueEndPos = 0;
  let result = [];

  while ((valueStartPos = content.indexOf(value, valueStartPos)) >= 0) {
    valueEndPos = valueStartPos + valueLen;

    let tagStartPos = valueStartPos;
    let tagEndPos = content.indexOf('>', valueEndPos) + 1;
    while (tagStartPos >= 0 && content.charAt(--tagStartPos) !== '<') {}

    result.push({
      value,
      attrs: parseAttributes(content.slice(tagStartPos, tagEndPos)),
      tagStartPos,
      tagEndPos,
      valueStartPos,
      valueEndPos,
    });

    valueStartPos = valueEndPos;
  }

  return result;
};

/**
 * @param {string} svg The SVG content.
 * @return {{dataUrl: string, svgAttrs: Object<key:string, value:string>, innerSVG: string}}
 */
const parseSvg = (svg) => {
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
  const svgAttrs = parseAttributes(svgAttrsString);
  const innerSVG = svg.slice(svgAttrsEndPos + 1, svgCloseTagPos - svgOpenTagStartPos);

  // encode reserved chars in data URL for IE 9-11 (enable if needed)
  // const reservedChars = /["#%{}<>]/g;
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
};

const comparePos = (a, b) => a.valueStartPos - b.valueStartPos;

class AssetInline {
  static data = new Map();

  /**
   * @param {string} request
   * @return {boolean}
   */
  static isSvgFile(request) {
    const [file] = request.split('?', 1);
    return file.endsWith('.svg');
  }

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
    return item != null && item.source != null && item.inlineSvg?.issuerResources.has(issuer);
  }

  /**
   * @param {string} sourceFile
   * @param {string} issuer
   * @returns {string|null}
   */
  static getDataUrl(sourceFile, issuer) {
    const item = this.data.get(sourceFile);

    return item != null && item.source != null && item.dataUrl.issuers.has(issuer) ? item.source.dataUrl : null;
  }

  /**
   * @param {string} resource The resource file, including a query.
   * @param {string} issuer The source file of the issuer.
   * @param {boolean} isEntry Whether the issuer is an entry file.
   */
  static add(resource, issuer, isEntry) {
    let item = this.data.get(resource);

    if (!item) {
      item = {
        source: null,
      };
      this.data.set(resource, item);
    }

    item.isSvg = this.isSvgFile(resource);

    if (isEntry && item.isSvg) {
      // SVG can only be inlined in HTML, but in CSS it's a data URL
      if (!item.inlineSvg) {
        item.inlineSvg = {
          issuerResources: new Set(),
          issuerFilenames: new Set(),
        };
      }
      item.inlineSvg.issuerResources.add(issuer);
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
   * @param {AssetEntryOptions} entry The entry where is specified the resource.
   * @param {Module} module The Webpack module.
   * @param {Chunk} chunk The Webpack chunk.
   * @param {CodeGenerationResults|Object} codeGenerationResults Code generation results of resource modules.
   */
  static saveData(entry, module, chunk, codeGenerationResults) {
    const sourceFile = module.resource;
    const item = this.data.get(sourceFile);

    if (!item) return;

    if (item.isSvg) {
      // extract SVG content from the processed source via a loader like svgo-loader
      const svg = module.originalSource().source().toString();

      if (item.inlineSvg) {
        item.inlineSvg.issuerFilenames.add(entry.filename);
      }

      if (item.source == null) {
        item.source = parseSvg(svg);
      }
    } else if (item.source == null) {
      // data URL for binary resource
      const dataUrl = codeGenerationResults.getData(module, chunk.runtime, 'url').toString();
      item.source = { dataUrl };
    }
  }

  /**
   * Insert inline SVG in HTML.
   * Replacing a tag containing the svg source file with the svg element.
   *
   * @param {string} content The template content.
   * @param {string} entryFilename The output filename of template.
   * @return {string}
   */
  static inlineSvg(content, entryFilename) {
    const headStartPos = content.indexOf('<head');
    const headEndPos = content.indexOf('</head>', headStartPos);
    const hasHead = headStartPos >= 0 && headEndPos > headStartPos;
    let results = [];

    // parse all inline SVG images in HTML
    for (let [sourceFile, item] of this.data) {
      if (item?.inlineSvg?.issuerFilenames.has(entryFilename)) results.push(...parseValues(content, sourceFile));
    }

    results.sort(comparePos);

    // compile parsed data to HTML with inlined SVG
    const excludeAttrs = ['src', 'href', 'xmlns', 'alt'];
    let output = '';
    let pos = 0;

    for (let { value, attrs, tagStartPos, tagEndPos, valueStartPos, valueEndPos } of results) {
      const { source } = this.data.get(value);

      if (hasHead && tagStartPos < headEndPos) {
        // in head inline as data URL
        output += content.slice(pos, valueStartPos) + source.dataUrl;
        pos = valueEndPos;
      } else {
        // in body inline as SVG tag
        attrs = { ...source.svgAttrs, ...attrs };
        const attrsString = attrsToString(attrs, [...excludeAttrs, 'title']);
        const titleStr = 'title' in attrs ? attrs['title'] : 'alt' in attrs ? attrs['alt'] : null;
        const title = titleStr ? `<title>${titleStr}</title>` : '';
        const inlineSvg = `<svg${attrsString}>${title}${source.innerSVG}</svg>`;

        output += content.slice(pos, tagStartPos) + inlineSvg;
        pos = tagEndPos;
      }
    }

    return output + content.slice(pos);
  }
}

module.exports = AssetInline;
