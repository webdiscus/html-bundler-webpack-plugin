const path = require('path');
const Options = require('./Options');
const { detectIndent, getFileExtension } = require('../Common/Helpers');
const { optionPreloadAsException } = require('./Messages/Exception');

/**
 * Media types that differ from file extension.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 */
const mimeType = {
  audio: {
    oga: 'audio/ogg',
    mp3: 'audio/mpeg',
    weba: 'audio/webm',
  },
  video: {
    ogv: 'video/ogg',
    webm: 'video/webm',
  },
  image: {
    svg: 'image/svg+xml',
    jpg: 'image/jpeg',
    tif: 'image/tiff',
  },
  font: {
    svg: 'image/svg+xml',
  },
};

/**
 * The valid type values of content for 'as' attribute.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
 *
 * @type {Array<string>}
 */
const contentType = [
  'audio',
  'document',
  'embed',
  'font',
  'image',
  'object',
  'script',
  'style',
  'track',
  'video',
  'worker',
];

/**
 * Content types whose 'type' attribute can be omitted.
 *
 * @type {Set<string>}
 */
const optionalTypeBy = new Set(['script', 'style']);

class Preload {
  /**
   *
   * @param {AssetEntryOptions} entry The entry where is specified the resource.
   * @param {FileInfo|null} issuer The issuer file info.
   * @param {string} assetFile The asset output filename.
   * @return {string}
   */
  static getPreloadFile(entry, issuer, assetFile) {
    if (issuer && issuer.resource !== entry.resource) {
      // recovery preload output file of an asset relative by entry point
      const issuerDir = path.dirname(issuer.filename);
      const webRootPath = path.posix.join(issuerDir, assetFile);
      assetFile = Options.getAssetOutputFile(webRootPath, entry.filename);
    }

    return assetFile;
  }

  /**
   * Generates and injects preload tags in the head for all matching source files resolved in templates and styles.
   *
   * @param {string} content The template content.
   * @param {string} entryAsset The output filename of template.
   * @param {Map} collection The reference to `Collection.data`.
   */
  static insertPreloadAssets(content, entryAsset, collection) {
    const data = collection.get(entryAsset);
    if (!data) return;

    const options = Options.getPreload();
    if (!options || !content) return;

    const insertPos = this.#findInsertPos(content);
    if (insertPos < 0) {
      // TODO: show warning - the template must contain the <head></head> tag to inject preloading assets.
      return;
    }

    const preloadAssets = new Map();
    const LF = Options.getLF();
    const indent = LF + detectIndent(content, insertPos - 1);
    const groupBy = {};

    // create sorted groups in the order of the specified 'preload' options
    options.forEach(({ as }) => (groupBy[as] = []));

    // prepare a flat array with preload assets
    for (let item of data.resources) {
      if (item.inline) continue;
      const assets = item?.ref?.assets ? item.ref.assets : item.assets;
      const conf = options.find(({ test }) => test.test(item.resource));

      if (conf) {
        if (Array.isArray(item.chunks)) {
          // js
          for (let { chunkFile, assetFile } of item.chunks) {
            preloadAssets.set(assetFile, conf);
          }
        } else {
          // css
          preloadAssets.set(item.assetFile, conf);
        }
      }

      // assets in css
      if (Array.isArray(assets)) {
        for (const assetItem of assets) {
          if (assetItem.inline) continue;

          const conf = options.find(({ test }) => test.test(assetItem.resource));
          if (!conf) continue;

          let preloadFile = assetItem.issuer
            ? this.getPreloadFile(data.entry, assetItem.issuer, assetItem.assetFile)
            : assetItem.assetFile;

          preloadAssets.set(preloadFile, conf);
        }
      }
    }

    // save generated preload tags for verbose
    data.preloads = [];

    for (const [filename, conf] of preloadAssets.entries()) {
      // determine the order of the main attributes in the link tag
      const props = { rel: 'preload', href: undefined, as: undefined, type: undefined };

      if (!conf.attributes) conf.attributes = {};
      if (conf.rel) props.rel = conf.rel;
      if (conf.as) props.as = conf.as;
      if (conf.type) props.type = conf.type;

      const attrs = { ...props, ...conf.attributes };
      const hasType = 'type' in conf || 'type' in conf.attributes;

      // note: `as` property is a required valid value
      if (!attrs.as || contentType.indexOf(attrs.as) < 0) {
        optionPreloadAsException(conf);
      }

      attrs.href = filename;

      if (!optionalTypeBy.has(attrs.as) && !hasType) {
        const ext = getFileExtension(filename);
        attrs.type = mimeType[attrs.as]?.[ext] || attrs.as + '/' + ext;
      }

      let tag = `<link`;
      for (const [key, value] of Object.entries(attrs)) {
        if (value != null) tag += ` ${key}="${value}"`;
      }
      tag += '>';

      data.preloads.push({
        filename,
        type: attrs.as || attrs.type,
        tag,
      });

      groupBy[attrs.as].push(tag);
    }

    const tags = Object.values(groupBy).flat();

    if (tags.length) {
      const str = tags.join(indent) + indent;
      return content.slice(0, insertPos) + str + content.slice(insertPos);
    }
  }

  /**
   * Find start position in the content to insert generated tags.
   *
   * @param {string} content
   * @return {number} Returns the position to insert place or -1 if the head tag not found.
   */
  static #findInsertPos(content) {
    let headStartPos = content.indexOf('<head');
    if (headStartPos < 0) {
      return -1;
    }

    let headEndPos = content.indexOf('</head>', headStartPos);
    if (headEndPos < 0) {
      return -1;
    }

    let startPos = content.indexOf('<link', headStartPos);
    if (startPos < 0) {
      startPos = content.indexOf('<script', headStartPos);
    }
    if (startPos < 0 || startPos > headEndPos) {
      startPos = headEndPos;
    }

    return startPos;
  }
}

module.exports = Preload;
