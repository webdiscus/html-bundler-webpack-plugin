const path = require('path');
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
  pluginOption = null;

  constructor(pluginOption) {
    this.pluginOption = pluginOption;
  }

  /**
   * @param {AssetEntryOptions} entry The entry where is specified the resource.
   * @param {FileInfo|null} issuer The issuer file info.
   * @param {string} assetFile The asset output filename.
   * @return {string}
   */
  getPreloadFile(entry, issuer, assetFile) {
    if (
      (this.pluginOption.autoPublicPath || this.pluginOption.isRelativePublicPath) &&
      issuer &&
      issuer.resource !== entry.resource
    ) {
      // recovery preload output file of an asset relative by entry point
      const issuerDir = path.dirname(issuer.filename);
      const webRootPath = path.posix.join(issuerDir, assetFile);

      assetFile = this.pluginOption.getAssetOutputFile(webRootPath, entry.filename);
    }

    return assetFile;
  }

  /**
   * Generates and injects preload tags in the head for all matching source files resolved in templates and styles.
   *
   * @param {string} content The template content.
   * @param {string} entryAsset The output filename of template.
   * @param {Map} collection The reference to `Collection data`.
   * @throws
   */
  insertPreloadAssets(content, entryAsset, collection) {
    const data = collection.get(entryAsset);
    if (!data) return;

    const options = this.pluginOption.getPreload();
    if (!options || !content) return;

    const insertPos = this.#findInsertPos(content);
    if (insertPos < 0) {
      // TODO: show warning - the template must contain the <head></head> tag to inject preloading assets.
      return;
    }

    const preloadAssets = new Map();
    const LF = this.pluginOption.getLF();
    const indent = LF + detectIndent(content, insertPos - 1);
    const groupBy = {};

    // normalize preload attributes and create sorted groups in the order of the specified 'preload' options
    for (const conf of options) {
      const as = conf.as || conf.attributes?.as;

      // note: `as` property is a required valid value
      if (!as || contentType.indexOf(as) < 0) {
        optionPreloadAsException(conf, as, contentType);
      }

      // determine the order of the attributes in the link tag
      const attrs = { rel: 'preload', href: undefined, as, type: undefined, ...(conf.attributes || {}) };

      // override attributes with the main properties
      if (conf.rel) attrs.rel = conf.rel;
      if (conf.type) attrs.type = conf.type;

      // for the `font` type, the `crossorigin` attribute is mandatory, if it is not defined, set to default value
      if (as === 'font' && !('crossorigin' in attrs)) attrs.crossorigin = true;

      // whether the 'type' property exist regardless of a value;
      // if the property exists and have the undefined value, exclude this attribute in generating preload tag
      const hasType = 'type' in conf || (conf.attributes && 'type' in conf.attributes) || optionalTypeBy.has(attrs.as);

      // filter
      const filter = this.pluginOption.normalizeAdvancedFiler(conf.test, conf.filter);

      // save normalized options
      conf._opts = { attrs, hasType, filter };

      groupBy[as] = [];
    }

    // prepare a flat array with preload assets
    for (let item of data.assets) {
      if (item.inline) continue;

      const assets = item.assets;
      const conf = options.find(({ test }) => test.test(item.resource));

      if (conf) {
        if (Array.isArray(item.chunks)) {
          // js
          for (let { chunkFile, assetFile } of item.chunks) {
            // sourceFiles contain only one file
            let sourceFiles = [item.resource];
            let outputFile = assetFile;

            if (this.pluginOption.applyAdvancedFiler({ sourceFiles, outputFile }, conf._opts.filter)) {
              preloadAssets.set(assetFile, conf._opts);
            }
          }
        } else {
          // css, images, fonts, etc
          // sourceFiles may contain many file, when many style files are imported in a JS file,
          // then all generated CSS contents will be squashed into one CSS file
          let sourceFiles = Array.isArray(item.resource) ? item.resource : [item.resource];
          let outputFile = item.assetFile;

          if (this.pluginOption.applyAdvancedFiler({ sourceFiles, outputFile }, conf._opts.filter)) {
            preloadAssets.set(item.assetFile, conf._opts);
          }
        }

        // dynamic imported modules, asyncChunks
        if (Array.isArray(item.children)) {
          for (let { chunkFile, assetFile, sourceFile } of item.children) {
            // sourceFiles contain only one file
            let sourceFiles = [sourceFile];
            let outputFile = assetFile;

            if (this.pluginOption.applyAdvancedFiler({ sourceFiles, outputFile }, conf._opts.filter)) {
              preloadAssets.set(assetFile, conf._opts);
            }
          }
        }
      }

      // assets in css
      if (Array.isArray(assets)) {
        for (const assetItem of assets) {
          if (assetItem.inline) continue;

          const conf = options.find(({ test }) => test.test(assetItem.resource));
          if (!conf) continue;

          // sourceFiles contain only one file
          let sourceFiles = [assetItem.resource];
          let outputFile = assetItem.issuer
            ? this.getPreloadFile(data.entry, assetItem.issuer, assetItem.assetFile)
            : assetItem.assetFile;

          if (this.pluginOption.applyAdvancedFiler({ sourceFiles, outputFile }, conf._opts.filter)) {
            preloadAssets.set(outputFile, conf._opts);
          }
        }
      }
    }

    // save generated preload tags for verbose
    data.preloads = [];
    for (const [filename, opts] of preloadAssets.entries()) {
      const attrs = { ...opts.attrs };

      attrs.href = filename;
      if (!opts.hasType) {
        const ext = getFileExtension(filename);
        attrs.type = mimeType[attrs.as]?.[ext] || attrs.as + '/' + ext;
      }

      let tag = `<link`;
      for (const [key, value] of Object.entries(attrs)) {
        if (value === true) tag += ` ${key}`;
        else if (value != null) tag += ` ${key}="${value}"`;
      }
      tag += '>';

      data.preloads.push({
        filename,
        type: attrs.as || attrs.type,
        tag,
      });

      groupBy[attrs.as].push(tag);
    }

    // inject preload tags into the template
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
  #findInsertPos(content) {
    let headStartPos = content.indexOf('<head');
    if (headStartPos < 0) {
      return -1;
    }

    let headEndPos = content.indexOf('</head>', headStartPos);
    if (headEndPos < 0) {
      return -1;
    }

    let startPos = content.indexOf('<link', headStartPos);
    if (startPos < 0 || startPos > headEndPos) {
      startPos = content.indexOf('<script', headStartPos);
    }
    if (startPos < 0 || startPos > headEndPos) {
      startPos = headEndPos;
    }

    return startPos;
  }
}

module.exports = Preload;
