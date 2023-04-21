const Options = require('./Options');
const AssetInline = require('./AssetInline');
const AssetTrash = require('./AssetTrash');
const Preload = require('./Preload');

// TODO: remove polyfill when support for node.js 14 is dropped
const hasReplaceAll = !!String.prototype.replaceAll;
const replaceAll = (str, search, replace) => {
  return str.replace(new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

/**
 * Collection of script and style files parsed in a template.
 */

class Collection {
  static files = new Map();
  static data = new Map();

  /**
   * Resource types.
   *
   * @type {{resource: string, inlineSvg: string, style: string, script: string}}
   */
  static type = {
    style: 'style',
    script: 'script',
    resource: 'resource',
    inlineSvg: 'inline/svg',
  };

  static ScriptOrStyleType = new Set(['script', 'style']);

  /**
   * @param {AssetEntryOptions} entry The entry point.
   */
  static initEntry(entry) {
    const { request, filename } = entry;

    // create entry point in data
    if (entry.isTemplate) this.setData(entry, null, {});

    for (const item of this.files.values()) {
      if (item.entryRequests.has(request)) {
        item.entryFilenames.add(filename);
      }
    }
  }

  /**
   * Whether resource is a script.
   *
   * @param {string} resource The resource file.
   * @return {boolean}
   */
  static isScript(resource) {
    return this.files.get(resource)?.type === this.type.script;
  }

  /**
   * Whether resource is a style.
   *
   * @param {string} resource The resource file.
   * @return {boolean}
   */
  static isStyle(resource) {
    return this.files.get(resource)?.type === this.type.style;
  }

  /**
   * @param {{__isScript?:boolean|undefined, resource:string}} module The Webpack chunk module.
   * Properties:<br>
   *   __isScript is cached state whether the Webpack module was resolved as JavaScript;<br>
   *   resource is source file of Webpack module.
   *
   * @return {boolean}
   */
  static isModuleScript(module) {
    if (module.__isScript == null) {
      module.__isScript = this.isScript(module.resource);
    }

    return module.__isScript;
  }

  // Reserved for future. Enable when will be used the AssetCompiler.beforeBuildModule.
  // /**
  //  * @param {{__isStyle?:boolean|undefined, resource:string}} module The Webpack chunk module.
  //  * Properties:<br>
  //  *   __isStyle {boolean} The cached state whether the Webpack module was resolved as style.<br>
  //  *   resource {string} The source file of Webpack module.<br>
  //  *
  //  * @return {boolean}
  //  */
  // static isModuleStyle(module) {
  //   if (module.__isStyle == null) {
  //     module.__isStyle = this.isStyle(module.resource);
  //   }
  //
  //   return module.__isStyle;
  // }

  /**
   * Whether resource is an inlined style.
   *
   * @param {string} resource The resource file.
   * @return {boolean}
   */
  static isInlineStyle(resource) {
    const item = this.files.get(resource);

    return item != null && item.inline && item.type === this.type.style;
  }

  /**
   * Add the resource.
   * Called in loader by parsing scripts and styles.
   *
   * @param {string} resource The resource file, including query.
   * @param {string} issuer The issuer request of resource.
   * @param {string} type The type of resource. One of: `script`, `style`.
   */
  static add(resource, issuer, type) {
    // note: the same source file can be either as file or as inlined,
    // but can't be in one place as file and in other as inlined
    let item = this.files.get(resource);
    let inline = false;

    if (type === this.type.script) {
      inline = Options.isInlineJs(resource);
    } else if (type === this.type.style) {
      inline = Options.isInlineCss(resource);
    }

    if (!item) {
      item = {
        // entry name, used only when resource is defined in Webpack entry
        name: undefined,
        // type of resource, 'script' or 'style'
        type: type,
        // whether resource should be inlined in HTML
        inline,
        // entry source requests where the resource is loaded
        entryRequests: new Set(),
        // entry output filenames to match entry in compilation.assets
        entryFilenames: new Set(),
      };
      this.files.set(resource, item);
    }

    item.entryRequests.add(issuer);
  }

  /**
   * Set asset name, the filename part w/o path, hash, extension.
   * One script can be used in many templates.
   *
   * @param {string} resource The resource file, including query.
   * @param {string} name The unique name of entry point.
   */
  static setName(resource, name) {
    const item = this.files.get(resource);
    if (item) {
      item.name = name;
    }
  }

  /**
   * Save info of resolved data.
   *
   * TODO: set .ref for css from node module
   *
   * Note[1]: resolve the collision when the same issuer, e.g. a style file, is used in many entries.
   *   If an issuer then only by first usage is set the data.
   *   In this case, we use the unique reference object to save common used assets.
   *
   *   If an issuer is an inlined file, then for each usage is set the data.
   *   In this case, we save assets in local data object, because asset output filenames can be different
   *   by entries with different output paths, eg.: 'home/' -> 'img/fig.png', 'home/en/' -> '../img/fig.png'.
   *
   * @param {AssetEntryOptions} entry The entry where is specified the resource.
   * @param {FileInfo|null} issuer The issuer of the resource, can be a template, style or script.
   * @param {string} type The type of resource.
   * @param {boolean} inline Whether should be inlined into HTML.
   * @param {string} resource The resource file, including query.
   * @param {string|null} assetFile The output filename.
   * @param {string|null} source The source content of asset.
   */
  static setData(entry, issuer, { type, inline, resource, assetFile = null, source = null } = {}) {
    const { filename } = entry;
    const entryPoint = this.data.get(filename);

    // 1. create entry point
    if (!entryPoint) {
      this.data.set(filename, { entry, resources: [] });
      return;
    }

    const resources = entryPoint.resources;
    const data = { type, inline, resource, assetFile };

    // 2. create a style or script
    if (this.ScriptOrStyleType.has(type)) {
      // set reference to original object, because same resource can be used in many entries, 1:n
      data.ref = this.files.get(data.resource);

      // if CSS is imported with a filename, including the `.css` extension, e.g. `@import 'npm-module/styles.css'`,
      // this file will not be injected into the compiled CSS, but it will be loaded as a separate file
      if (!data.ref) {
        data.ref = { assets: [] };
      }

      resources.push(data);

      return;
    }

    // 3.1. add a resource data to an entry
    if (issuer.resource === entry.request) {
      resources.push(data);
      return;
    }

    // find a parent resource (style) to add the resource as the dependency
    const parent = resources.find((item) => item.resource === issuer.resource);
    let assetsRef = parent;

    // see the Note[1] in docBlock
    if (!parent.inline) {
      assetsRef = parent.ref;
      data.issuer = issuer;
    }

    // 3.2. add the dependency to the parent
    if (assetsRef.assets == null) {
      assetsRef.assets = [data];
    } else {
      assetsRef.assets.push(data);
    }
  }

  /**
   * Set resolved output filename of asset.
   *
   * @param {AssetEntryOptions} entry The entry where is specified the resource.
   * @param {FileInfo} assetInfo The asset file info.
   */
  static setDataFilename(entry, assetInfo) {
    const entryPoint = this.data.get(entry.filename);
    if (!entryPoint) return;

    const item = entryPoint.resources.find(({ resource }) => resource === assetInfo.resource);
    item.assetFile = assetInfo.filename;
  }

  /**
   * Set source code for inlined asset.
   *
   * @param {AssetEntryOptions} entry The entry where is defined the asset.
   * @param {string} resource The resource file, including query.
   * @param {string} source The source content of asset.
   */
  static setDataSource(entry, resource, source) {
    const { resources } = Collection.data.get(entry.filename);
    const asset = resources.find((item) => item.resource === resource);
    if (asset) {
      asset.source = source;
    }
  }

  /**
   * Render all resolved assets in contents.
   * Inline JS, CSS, substitute output JS filenames.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @param {Function} callback The callback to allow to modify the content with an external function.
   */
  static render(compilation, callback = null) {
    const RawSource = compilation.compiler.webpack.sources.RawSource;
    const LF = Options.getLF();
    const hasCallback = typeof callback === 'function';

    this.#prepareScriptData(compilation);

    for (const [entryFilename, { entry, resources }] of this.data) {
      const rawSource = compilation.assets[entryFilename];

      if (!rawSource) return;

      let hasInlineSvg = false;
      let content = rawSource.source();

      for (const asset of resources) {
        const { type, inline, resource } = asset;

        if (inline && type === this.type.inlineSvg) {
          hasInlineSvg = true;
          continue;
        }

        if (inline && type === this.type.style) {
          content = this.#inlineCSS(content, resource, asset, LF) || content;
        } else if (type === this.type.script) {
          content = this.#inlineAndReplaceJS(content, resource, asset, compilation.assets, LF) || content;
        }
      }

      if (hasInlineSvg) {
        content = AssetInline.inlineSvg(content, entryFilename);
      }

      if (Options.isPreload()) {
        content = Preload.insertPreloadAssets(content, entry.filename, this.data) || content;
      }

      if (hasCallback) {
        content = callback(content, entry) || content;
      }

      compilation.assets[entryFilename] = new RawSource(content);
    }
  }

  static #inlineCSS(content, search, asset, LF) {
    const pos = content.indexOf(search);
    if (pos < 0) return false;

    const tagEnd = '>';
    const openTag = '<style>';
    let closeTag = '</style>';
    let tagStartPos = pos;
    let tagEndPos = pos + search.length;

    while (tagStartPos >= 0 && content.charAt(--tagStartPos) !== '<') {}
    tagEndPos = content.indexOf(tagEnd, tagEndPos) + tagEnd.length;

    // add LF after injected scripts when next char is not a new line
    if ('\n\r'.indexOf(content[tagEndPos]) < 0) closeTag += LF;

    return content.slice(0, tagStartPos) + openTag + asset.source + closeTag + content.slice(tagEndPos);
  }

  static #inlineAndReplaceJS(content, search, asset, sources, LF) {
    const pos = content.indexOf(search);
    if (pos < 0) return false;

    const { inline, chunks } = asset;
    const tagEnd = '</script>';
    let beginStr = '<script>';
    let endStr = '</script>';
    let srcStartPos = pos;
    let srcEndPos = srcStartPos + search.length;
    let tagStartPos = srcStartPos;
    let tagEndPos = srcEndPos;
    let replacement = '';

    while (tagStartPos >= 0 && content.charAt(--tagStartPos) !== '<') {}
    tagEndPos = content.indexOf(tagEnd, tagEndPos) + tagEnd.length;

    if (!inline) {
      if (chunks.length === 1) {
        // TODO: remove polyfill when support for node.js 14 is dropped
        return hasReplaceAll
          ? content.replaceAll(search, chunks[0].assetFile)
          : replaceAll(content, search, chunks[0].assetFile);
      } else {
        beginStr = content.slice(tagStartPos, srcStartPos);
        endStr = content.slice(srcEndPos, tagEndPos);
      }
    }

    for (let { chunkFile, assetFile } of chunks) {
      const str = inline ? sources[chunkFile].source() : assetFile;

      if (replacement) replacement += LF;
      replacement += beginStr + str + endStr;
    }

    // add LF after injected scripts when next char is not a new line
    if ('\n\r'.indexOf(content[tagEndPos]) < 0) replacement += LF;

    return content.slice(0, tagStartPos) + replacement + content.slice(tagEndPos);
  }

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  static #prepareScriptData(compilation) {
    const { assets, assetsInfo, chunks, namedChunkGroups } = compilation;
    const splitChunks = new Set();
    const chunkCache = new Map();

    for (let [resource, { type, inline, name, entryFilenames }] of this.files) {
      if (type !== this.type.script) continue;

      const chunkGroup = namedChunkGroups.get(name);

      // prevent error when in HMR mode after removing a script in the template
      if (!chunkGroup) continue;

      const chunkFiles = chunkGroup.getFiles().filter((file) => assetsInfo.get(file).hotModuleReplacement !== true);
      const isSplitChunks = chunkFiles.length > 1;

      for (let entry of entryFilenames) {
        // let's show an original error
        if (!assets.hasOwnProperty(entry)) continue;

        const data = { type, inline, resource, chunks: [] };
        let injectedChunks;

        if (isSplitChunks) {
          if (!chunkCache.has(entry)) chunkCache.set(entry, new Set());
          injectedChunks = chunkCache.get(entry);
        }

        for (let chunkFile of chunkFiles) {
          if (isSplitChunks) {
            if (injectedChunks.has(chunkFile)) continue;
            injectedChunks.add(chunkFile);
          }

          let assetFile = undefined;
          if (inline === true) {
            AssetTrash.add(chunkFile);
          } else {
            assetFile = Options.getAssetOutputFile(chunkFile, entry);
            splitChunks.add(chunkFile);
          }
          data.chunks.push({ chunkFile, assetFile });
        }

        this.data.get(entry).resources.push(data);
      }
    }

    // remove generated unused split files
    for (let { chunkReason, files } of chunks) {
      if (chunkReason && chunkReason.startsWith('split chunk')) {
        for (let file of files) {
          if (!splitChunks.has(file)) AssetTrash.add(file);
        }
      }
    }
  }

  /**
   * Clear cache.
   * Called only once, when the plugin is applied.
   */
  static clear() {
    this.files.clear();
    this.data.clear();
  }

  /**
   * Reset settings.
   * Called before each new compilation after changes, in the serv/watch mode.
   */
  static reset() {
    this.files.forEach((item, key) => {
      if (item.assets != null) item.assets.length = 0;
    });
    this.data.clear();
  }
}

module.exports = Collection;
