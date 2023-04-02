const Options = require('./Options');
const { detectIndent } = require('../Common/Helpers');

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
 * The valid values of the type of content for 'as' attribute.
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
 * @type {Array<string>}
 */
const ignoreTypeBy = ['script', 'style'];

class Preload {
  static assets = new Map();

  /**
   * @param {string} filename The entry output filename.
   * @param {{sourceFile: string, assetFile: string}} asset The object with asset properties.
   */
  static add(filename, asset) {
    const assets = this.assets.get(filename);

    if (!assets) {
      this.assets.set(filename, [asset]);
      return;
    }

    const exists = !!assets.find(({ assetFile }) => asset.assetFile === assetFile);

    if (!exists) {
      // add only unique asset
      assets.push(asset);
    }
  }

  /**
   * Generates and injects preload tags in the head for all matching source files resolved in templates and styles.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  static insertPreloadAssets(compilation) {
    const options = Options.getPreload();

    if (!options) return;

    const {
      assets,
      compiler: {
        webpack: {
          sources: { RawSource },
        },
      },
    } = compilation;
    const LF = Options.getLF();

    for (const [entry, asset] of this.assets) {
      const content = assets[entry]?.source();

      // show original error
      if (!content) return;

      const insertPos = this.#findInsertPos(content);

      if (insertPos < 0) {
        // TODO: show warning - the template must contain the <head></head> tag to inject preloading assets.
        continue;
      }

      const indent = detectIndent(content, insertPos - 1);

      // create sorted groups in the order of the specified 'preload' options
      const groupBy = {};
      options.forEach(({ as }) => (groupBy[as] = []));

      for (const { sourceFile, assetFile } of asset) {
        const conf = options.find(({ test }) => test.test(sourceFile));

        if (!conf) continue;

        // determine the order of the main attributes in the link tag
        const props = { rel: 'preload', href: undefined, as: undefined, type: undefined };
        // get the asset extension
        const [file] = assetFile.split('?', 1);
        const extPos = file.lastIndexOf('.');
        const ext = extPos > 0 ? assetFile.slice(extPos + 1) : '';

        if (!conf.attributes) conf.attributes = {};
        if (conf.rel) props.rel = conf.rel;
        if (conf.as) props.as = conf.as;
        if (conf.type) props.type = conf.type;

        const attrs = { ...props, ...conf.attributes };
        const hasType = 'type' in conf || 'type' in conf.attributes;

        // note: `as` property is a required valid value
        if (!attrs.as || contentType.indexOf(attrs.as) < 0) {
          // TODO: throw exception
          continue;
        }

        if (ignoreTypeBy.indexOf(attrs.as) < 0 && !hasType) {
          attrs.type = mimeType[attrs.as]?.[ext] || attrs.as + '/' + ext;
        }

        attrs.href = assetFile;

        let tag = `<link`;
        for (const key in attrs) {
          let val = attrs[key];
          if (val == null) continue;
          tag += ` ${key}="${val}"`;
        }
        tag += '>' + LF + indent;

        groupBy[attrs.as].push(tag);
      }

      let preloadTags = Object.values(groupBy).flat().join('');

      if (preloadTags) {
        const newContent = content.slice(0, insertPos) + preloadTags + content.slice(insertPos);

        // update compilation asset content
        assets[entry] = new RawSource(newContent);
      }
    }
  }

  /**
   * Find start position in the content to insert generated tags.
   *
   * @param {string} content
   * @return {number|boolean} Returns the position to insert place or false if the head tag not found.
   */
  static #findInsertPos(content) {
    let headStartPos = content.indexOf('<head');
    if (headStartPos < 0) {
      return false;
    }

    let headEndPos = content.indexOf('</head>', headStartPos);
    if (headEndPos < 0) {
      return false;
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

  /**
   * Reset settings.
   * Called before each compilation after changes by `webpack serv/watch`.
   */
  static reset() {
    this.assets.clear();
  }
}

module.exports = Preload;
