const {
  ASSET_MODULE_TYPE,
  ASSET_MODULE_TYPE_INLINE,
  ASSET_MODULE_TYPE_SOURCE,
  ASSET_MODULE_TYPE_RESOURCE,
} = require('webpack/lib//ModuleTypeConstants');

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
 * @param {string} content
 * @return {string}
 */
const encodeDataUrlContent = (content) => {
  // alternative to encodeURIComponent - encode reserved chars in data URL for IE 9-11 (enable if needed)
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

  // encode only reserved chars in data URL for modern browsers
  // note: `<` and `>` are not encoded because they are inside the SVG tag (not in an attribute or query string)
  const reservedChars = /["#%{}]/g;
  const charReplacements = {
    '"': "'",
    '#': '%23',
    '%': '%25',
    '{': '%7B',
    '}': '%7D',
  };

  const replacer = (char) => charReplacements[char];

  // we don't want use the encodeURIComponent() because it encodes space too that make content bigger then base64
  return content.replace(/\s+/g, ' ').replace(reservedChars, replacer);
};

/**
 * @param {string} source The SVG content or data URL containing SVG.
 * @return {{dataUrl: string, svgAttrs: Object<key:string, value:string>, innerSVG: string}}
 */
const parseSvg = (source) => {
  let isDataUrl = source.startsWith('data:');
  let isEncodedBase64 = false;
  let contentRaw = source;
  let dataUrl;

  // decode data from base64
  if (isDataUrl) {
    dataUrl = source;

    let encoding = 'base64,';
    let pos = dataUrl.indexOf(encoding);

    if (pos > 0) {
      isEncodedBase64 = true;
      contentRaw = source.slice(pos + encoding.length);
      contentRaw = Buffer.from(contentRaw, 'base64').toString('utf-8');
    }
  } else {
    // TODO: add option to custom URI encoding
    //dataUrl = 'data:image/svg+xml,' + encodeDataUrlContent(source);
    dataUrl = 'data:image/svg+xml,' + encodeURIComponent(source);
  }

  if (!isEncodedBase64) {
    contentRaw = decodeURIComponent(contentRaw);
  }

  const svgOpenTag = '<svg';
  const svgCloseTag = '</svg>';
  const svgOpenTagStartPos = contentRaw.indexOf(svgOpenTag);
  const svgCloseTagPos = contentRaw.indexOf(svgCloseTag, svgOpenTagStartPos);

  if (svgOpenTagStartPos > 0) {
    // extract SVG content only, ignore xml tag and comments before SVG tag
    contentRaw = contentRaw.slice(svgOpenTagStartPos, svgCloseTagPos + svgCloseTag.length);
  }

  // parse SVG attributes and extract inner content of SVG
  const svgAttrsStartPos = svgOpenTag.length;
  const svgAttrsEndPos = contentRaw.indexOf('>', svgAttrsStartPos);
  const svgAttrsString = contentRaw.slice(svgAttrsStartPos, svgAttrsEndPos);
  const svgAttrs = parseAttributes(svgAttrsString);
  const innerSVG = contentRaw.slice(svgAttrsEndPos + 1, svgCloseTagPos - svgOpenTagStartPos);

  return {
    svgAttrs,
    innerSVG,
    dataUrl,
  };
};

const comparePos = (a, b) => a.valueStartPos - b.valueStartPos;

class AssetInline {
  data = new Map();

  constructor() {}

  /**
   * @param {string} request
   * @return {boolean}
   */
  isSvgFile(request) {
    const [file] = request.split('?', 1);

    return file.toLowerCase().endsWith('.svg');
  }

  /**
   * Whether the request is data URL.
   *
   * @param {string} request The request of asset.
   * @returns {boolean}
   */
  isDataUrl(request) {
    return request.startsWith('data:');
  }

  /**
   * @param {string} sourceFile
   * @param {string} issuer
   * @returns {boolean}
   */
  isInlineSvg(sourceFile, issuer) {
    const item = this.data.get(sourceFile);

    return item?.source && item.inlineSvg?.issuerResources.has(issuer);
  }

  /**
   * @param {string} sourceFile
   * @param {string} issuer
   * @returns {string|null}
   */
  getDataUrl(sourceFile, issuer) {
    const item = this.data.get(sourceFile);

    if (!item?.source) {
      return null;
    }

    // TODO: simplify the structure into one issuers list

    if (item.inlineSvg) {
      const issuers = item.inlineSvg.issuerResources;
      if (issuers.has(issuer)) {
        return item.source.dataUrl;
      }
    }

    if (item.dataUrl) {
      const issuers = item.dataUrl.issuers;
      if (issuers.has(issuer)) {
        return item.source.dataUrl;
      }
    }

    return null;
  }

  /**
   * @param {string} resource The resource file, including a query.
   * @param {string} issuer The source file of the issuer.
   * @param {boolean} isEntry Whether the issuer is an entry file.
   */
  add(resource, issuer, isEntry) {
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
          // note: one source may have many filenames, e.g. when form the same template will be generate many pages
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
   * @param {Chunk} chunk The Webpack chunk.
   * @param {Module} module The Webpack module.
   * @param {CodeGenerationResults|Object} codeGenerationResults Code generation results of resource modules.
   * @param {string} assetType The Webpack module.
   */
  saveData(entry, chunk, module, codeGenerationResults, assetType) {
    const { resource } = module;
    const item = this.data.get(resource);

    if (!item) return;

    if (item.isSvg) {
      if (item.inlineSvg) {
        item.inlineSvg.issuerFilenames.add(entry.filename);
      }
    }

    if (item.source == null) {
      // data URL for resource modified via `generator.dataUrl()`, in Webpack config
      let data = codeGenerationResults.getData(module, chunk.runtime, 'url');
      let source;

      if (assetType === ASSET_MODULE_TYPE_RESOURCE || !data) {
        source = source = module.originalSource().source().toString();
      } else if (data) {
        // note: webpack has introduced a braking change by 5.95.0 -> 5.96.0
        if (!data?.javascript) {
          // webpack <= 5.95.x: data is Buffer
          source = data.toString();
        } else if (data?.javascript) {
          // webpack => 5.96.0: data contains `javascript` key
          source = data?.javascript;

          // remove quotes in value like "data:image/..."
          if (source.at(0) === '"') {
            source = source.slice(1, -1);
          }
        } else {
          // warning as svg
          const warning1 = 'Downgrade your webpack.';
          const warning2 = 'This version is not compatible.';
          source = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='40' viewBox='0 0 200 40'><text y='15'>${warning1}</text><text dy='30'>${warning2}</text></svg>`;
        }
      }

      // reserved for debug: when asset type is resource the url contains output asset filename
      // if (!data || !source !source.startsWith('data:') || !source.startsWith('<svg')) {
      //   source = module.originalSource().source().toString();
      // }

      item.source = item.isSvg ? parseSvg(source) : { dataUrl: source };
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
  inlineSvg(content, entryFilename) {
    const headStartPos = content.indexOf('<head');
    const headEndPos = content.indexOf('</head>', headStartPos);
    const hasHead = headStartPos >= 0 && headEndPos > headStartPos;
    const alreadyUsedTagPos = new Set();
    let results = [];

    // parse all inline SVG images in HTML
    for (let [sourceFile, item] of this.data) {
      // TODO: optimize detection of correct output file(s) where it should be embedded
      if (item?.inlineSvg?.issuerFilenames.has(entryFilename)) {
        let parsedValues = parseValues(content, sourceFile);

        results.push(...parsedValues);
      }
    }

    results.sort(comparePos);

    // compile parsed data to HTML with inlined SVG
    const excludeAttrs = ['src', 'href', 'xmlns', 'alt'];
    let output = '';
    let pos = 0;

    for (let { value, attrs, tagStartPos, tagEndPos, valueStartPos, valueEndPos } of results) {
      // prevent double insert at the same position
      if (alreadyUsedTagPos.has(tagStartPos)) {
        continue;
      }
      alreadyUsedTagPos.add(tagStartPos);

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

  /**
   * Clear cache.
   * Called only once when the plugin is applied.
   */
  clear() {
    this.data.clear();
  }
}

module.exports = AssetInline;
