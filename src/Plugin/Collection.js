const path = require('path');
const Options = require('./Options');
const AssetEntry = require('./AssetEntry');
const AssetInline = require('./AssetInline');
const AssetTrash = require('./AssetTrash');
const Preload = require('./Preload');
const Dependency = require('../Loader/Dependency');

/**
 * @typedef {Object} CollectionData
 * @property {string} type The type of resource.
 * @property {boolean} inline Whether should be inlined into HTML.
 * @property {boolean} imported Whether the style is imported in JavaScript, for type == 'style' only.
 * @property {Array<CollectionData>|null} imports The imported styles in one JS file.
 * @property {string} issuer The resource of issuer, only if imports is not null.
 * @property {string} resource The resource file, including a query, only if imported is false.
 * @property {string|null} assetFile The output filename, only if imported is false.
 */

// TODO: remove polyfill when support for node.js 14 is dropped
const hasReplaceAll = !!String.prototype.replaceAll;
const replaceAll = (str, search, replace) => {
  return str.replace(new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

/**
 * Collection of script and style files parsed in a template.
 */

class Collection {
  static compilation = null;

  // resource files
  static files = new Map();
  static uniqueFiles = new Set();

  // entries data
  static data = new Map();

  /**
   * Unique last index for each file with the same name.
   * @type {Object<file: string, index: number>}
   */
  static index = {};

  static importStyleEsModule = true;
  static orderedResources = new Map();
  static importStyleRootIssuers = new Set();
  static importStyleSources = new Map();
  static importStyleIdx = 1000;

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
    template: 'template',
  };

  static ScriptOrStyleType = new Set(['script', 'style']);

  static setCompilation(compilation) {
    this.compilation = compilation;
  }

  /**
   * @param {string} file The source file of script.
   * @return {string } Return unique assetFile
   */
  static createUniqueName(file) {
    const { name } = path.parse(file);
    let uniqueName = name;

    // the entrypoint name must be unique, if already exists then add an index: `main` => `main.1`, etc.
    if (!AssetEntry.isUnique(name, file)) {
      // create unique name
      if (!this.index[name]) {
        this.index[name] = 1;
      }
      uniqueName = name + '.' + this.index[name]++;
    }

    return uniqueName;
  }

  // /**
  //  * Reserved method for debugging.
  //  *
  //  * @param {string} resource
  //  * @return {Array<string>}
  //  */
  // static getResourceIssuers(resource) {
  //   const item = this.files.get(resource);
  //
  //   if (!item) return [];
  //
  //   const issuers = Array.from(item.entries.keys());
  //
  //   // extract from all issuer's request only filename, w/o a query
  //   issuers.forEach((request, index) => {
  //     let [file] = request.split('?', 1);
  //     issuers[index] = file;
  //   });
  //
  //   return issuers;
  // }

  static addEntry(entry) {
    const entryPoint = this.data.get(entry.filename);
    if (entryPoint) {
      // skip already exists entry
      return;
    }

    this.setData(entry, null, {});
  }

  /**
   * @param {AssetEntryOptions} entry The entry point.
   */
  static setEntryDependencies(entry) {
    const { resource, filename } = entry;

    for (const item of this.files.values()) {
      const entryFilenames = item.entries.get(resource);
      if (entryFilenames) {
        entryFilenames.add(filename);
      }
    }
  }

  /**
   * Whether the collection contains the script file.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  static hasScript(resource) {
    return this.files.get(resource)?.type === this.type.script;
  }

  /**
   * Whether the collection contains the style file.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  static hasStyle(resource) {
    return this.files.get(resource)?.type === this.type.style;
  }

  static setImportStyleEsModule(state) {
    this.importStyleEsModule = state === true;
  }

  static isImportStyleEsModule() {
    return this.importStyleEsModule;
  }

  /**
   * @param {string} resource
   */
  static getGraphModule(resource) {
    const { moduleGraph } = this.compilation;
    const moduleMap = moduleGraph._moduleMap;

    for (let [module, graphModule] of moduleMap.entries()) {
      if (module.resource === resource) {
        return module;
      }
    }

    return null;
  }

  /**
   * TODO: Reserved for debug.
   * @param {string} resource
   */
  // static getCompilationModule(resource) {
  //   const { modules } = this.compilation;
  //   for (const module of modules) {
  //     if (module.resource === resource) {
  //       return module;
  //     }
  //   }
  //   return null;
  // }

  /**
   * Find styles from all nested JS files imported in the root JS file and sort them.
   *
   * @param {number} entryId The entry id of the template where is the root issuer.
   *  Note: the same issuer can be used in many entries.
   * @param {string} rootIssuer The root JS file loaded in template.
   * @param {Object} chunk
   * @return {Object[]}
   */
  static findImportedModules(entryId, rootIssuer, chunk) {
    const issuerModule = this.getGraphModule(rootIssuer);
    const modules = this.findDependenciesOfModule(issuerModule);
    const uniqueModules = [];

    // reserved for debug;
    // the modules are already sorted
    //modules.sort((a, b) => (a.order < b.order ? -1 : 1));

    // TODO: research how to unique modules used in the current issuer and in deep nested issuers;
    //  Currently the prio is for an first exemplar in nested issuers.
    //  See the test js-import-css-order-dependencies.
    //  For example:
    //  0:   a.css
    //  1.0: common.css // currently, is kept this file (imported in the nested js component)
    //  3:   b.css
    //  2:   common.css // perhaps, should be kept this?
    for (const { module } of modules) {
      if (!uniqueModules.includes(module)) {
        uniqueModules.push(module);
      }
    }

    // reserved for debug
    // console.log(
    //   '\n### modules:\n',
    //   modules.map(({ order, module }) => {
    //     return {
    //       order,
    //       resource: path.basename(module.resource),
    //     };
    //   })
    // );

    return uniqueModules;
  }

  /**
   * @param {Module} module The Webpack compilation module.
   * @returns {Array<{order: string, module: Module}>}
   */
  static findDependenciesOfModule(module) {
    const { moduleGraph } = this.compilation;
    let order = '';
    let orderStack = [];

    const walk = (module) => {
      const deps = module.dependencies;
      const result = [];

      for (const dependency of deps) {
        if (!dependency.userRequest) continue;

        const parentIndex = moduleGraph.getParentBlockIndex(dependency);
        let depModule = moduleGraph.getModule(dependency);

        // use the original NormalModule instead of ConcatenatedModule
        if (!depModule.resource && depModule.rootModule) {
          depModule = depModule.rootModule;
        }

        if (depModule.dependencies.length > 0) {
          // save current order before recursive walking
          orderStack.push(order);
          order += (order ? '.' : '') + parentIndex;
          result.push(...walk(depModule));
        } else if (depModule._isImportedStyle) {
          result.push({
            order: order + (order ? '.' : '') + parentIndex,
            module: depModule,
          });
        }
      }

      // recovery order
      order = orderStack.pop();

      return result;
    };

    return walk(module);
  }

  /**
   * Find the root issuer of a resource.
   *
   * @param {string} resource
   * @return {string|undefined}
   */
  static findRootIssuer(resource) {
    const moduleMap = this.compilation.moduleGraph._moduleMap;
    const modules = moduleMap.keys();
    const [resourceFile] = resource.split('?', 1);
    let current;
    let parent;

    for (let module of modules) {
      // skip non normal modules, e.g. runtime
      if (!module.resource) continue;

      const [file] = module.resource.split('?', 1);
      if (file === resourceFile) {
        current = module;
        break;
      }
    }

    if (current) {
      while ((parent = moduleMap.get(current).issuer)) {
        current = parent;
      }
    }

    return current && current.resource !== resource ? current.resource : undefined;
  }

  // Reserved for the future.
  // Enable when will be used the AssetCompiler.beforeBuildModule.
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
  //     module.__isStyle = this.hasStyle(module.resource);
  //   }
  //
  //   return module.__isStyle;
  // }

  /**
   * Whether resource is an inlined style.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  static isInlineStyle(resource) {
    const item = this.files.get(resource);

    return item != null && item.inline && item.type === this.type.style;
  }

  /**
   * @param {string} resource
   * @return {boolean}
   */
  static existsResource(resource) {
    return this.files.has(resource);
  }

  /**
   * @param {string} entryId The entry id where can be used imported styles.
   * @return {boolean}
   */
  static hasImportedStyle(entryId) {
    return this.importStyleRootIssuers.size > 0 && this.orderedResources.has(entryId);
  }

  /**
   * Add the resource.
   * Called in loader by parsing scripts and styles.
   *
   * @param {string} type The type of resource. One of: `script`, `style`.
   * @param {string} resource The resource file, including a query.
   * @param {string} issuer The issuer resource, including a query.
   * @param {string|number|null} entryId The entry id where is loaded the resource.
   */
  static add({ type, resource, issuer, entryId = null }) {
    // note: the same source file can be either as file or as inlined,
    // but can't be in one place as file and in another place as inlined
    let item = this.files.get(resource);
    let inline = false;
    let name;

    if (type === this.type.script) {
      this.addOrderedResource(entryId, resource);

      // get unique entry name
      name = this.files.get(resource)?.name;

      if (!name) {
        name = this.createUniqueName(resource);
        const entry = {
          name,
          importFile: resource,
          filenameTemplate: Options.getJs().filename,
          context: path.dirname(issuer),
          issuer,
        };

        AssetEntry.addToCompilation(entry);
      }

      inline = Options.isInlineJs(resource);
    } else if (type === this.type.style) {
      inline = Options.isInlineCss(resource);
    }

    if (!item) {
      item = {
        // entry name, used only if resource is defined in Webpack entry
        name,
        // type of resource, 'script' or 'style'
        type: type,
        // whether resource should be inlined in HTML
        inline,
        // the key is an entry source requests where the resource is loaded
        // the value are entry output filenames to match entry in compilation.assets
        entries: new Map(),
      };
      this.files.set(resource, item);
    }
    item.entries.set(issuer, new Set());
  }

  /**
   * Save resources by entry points in the order their location in the source code.
   *
   * Note: the order of script resources is important to inject the style files imported in JS into HTML.
   *
   * @param {string|number|null} entryId The entry id where is loaded the resource.
   * @param {string} resource The resource file, including a query.
   */
  static addOrderedResource(entryId, resource) {
    if (!entryId) return;

    let orderedResources = this.orderedResources.get(entryId);

    if (!orderedResources) {
      orderedResources = new Set();
      this.orderedResources.set(entryId, orderedResources);
    }

    orderedResources.add(resource);
  }

  /**
   * Save info of resolved data.
   *
   * Note[1]: resolve the collision when the same issuer, e.g., a style file, is used in many entries.
   *   If an issuer then only by first usage is set the data.
   *   In this case, we use the unique reference object to save commonly used assets.
   *
   *   If an issuer is an inlined file, then for each usage is set the data.
   *   In this case, we save assets in the local data object, because asset output filenames can be different
   *   by entries with different output paths, eg.: 'home/' -> 'img/fig.png', 'home/en/' -> '../img/fig.png'.
   *
   * @param {AssetEntryOptions} entry The entry where is specified the resource.
   * @param {FileInfo|null} issuer The issuer of the resource can be a template, style or script.
   * @param {CollectionData|{}} data The collection data.
   */
  static setData(entry, issuer, data = {}) {
    const { filename } = entry;
    const entryPoint = this.data.get(filename);

    // 1. create entry point
    if (!entryPoint) {
      this.data.set(filename, { entry, resources: [] });
      return;
    }

    const resources = entryPoint.resources;

    if (issuer) data.issuer = issuer;

    // 2. create a style or script
    if (this.ScriptOrStyleType.has(data.type)) {
      // set reference to an original object because the same resource can be used in many entries, 1:n
      data.ref = this.files.get(data.resource);

      // if CSS is imported with a filename, including the `.css` extension, e.g. `@import 'npm-module/styles.css'`,
      // this file will not be injected into the compiled CSS, but it will be loaded as a separate file
      if (!data.ref) {
        data.ref = { assets: [] };
      }

      resources.push(data);

      return;
    }

    // 3.1. add resource data to an entry
    if (issuer.resource === entry.resource) {
      resources.push(data);
      return;
    }

    // find a parent resource (style) to add the resource as the dependency
    const parent = resources.find((item) => item.resource === issuer.resource);
    let reference = parent;

    // for hmr
    if (!parent) return;

    // see the Note[1] in docBlock
    if (!parent.inline) {
      reference = parent.ref;
      data.issuer = issuer;
    }

    // 3.2. add the dependency to the parent
    if (reference.assets == null) {
      reference.assets = [data];
    } else {
      reference.assets.push(data);
    }
  }

  /**
   * Delete entry data.
   *
   * Called when used the dynamic entry in serve/watch mode.
   *
   * @param {string} resource
   */
  static deleteData(resource) {
    this.files.delete(resource);

    // find all keys, the same entry file can be used as a template for many entries
    let dataKey = [];
    for (const [key, item] of this.data) {
      if (item.entry.resource === resource) {
        dataKey.push({
          key,
          filename: item.entry.filename,
          resource,
        });
      }
    }

    dataKey.forEach(({ key, filename, resource }) => {
      this.data.delete(key);

      this.files.forEach((item, file) => {
        item.entries.delete(resource);
      });

      AssetTrash.add(filename);
    });

    Dependency.removeFile(resource);
  }

  /**
   * Disconnect entry in all resources.
   *
   * @param {string} resource The file of entry.
   */
  static disconnectEntry(resource) {
    for (const [, item] of this.files) {
      item.entries.delete(resource);
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

    // for hmr
    if (!item) {
      return;
    }

    item.assetFile = assetInfo.filename;
  }

  /**
   * Set source code for inlined asset.
   *
   * @param {AssetEntryOptions} entry The entry where is defined the asset.
   * @param {string|undefined} resource The resource file, including a query.
   *  This is used for styles specified in a template.
   * @param {string|undefined} issuer The issuer of the resource file.
   *  This is used for styles imported in JS.
   * @param {string} source The source content of asset.
   */
  static setDataSource(entry, resource, issuer, source) {
    const { resources } = Collection.data.get(entry.filename);
    let asset;

    if (resource) {
      asset = resources.find((item) => item.resource === resource);
    } else if (issuer) {
      asset = resources.find((item) => item.imports && item.issuer?.resource === issuer);
    }

    if (asset) {
      asset.source = source;
    }
  }

  /**
   * Render all resolved assets in contents.
   * Inline JS, CSS, substitute output JS filenames.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   * @param {Function} callback A callback that allows content to be modified using an external function.
   */
  static render(compilation, callback = null) {
    const { RawSource } = compilation.compiler.webpack.sources;
    const LF = Options.getLF();
    const hasCallback = typeof callback === 'function';

    this.#prepareScriptData(compilation);

    // TODO: update this.data.resources[].asset.resource after change the filename in a template
    //  - e.g. src="./main.js?v=1" => ./main.js?v=123 => WRONG filename is replaced
    for (const [entryFilename, { entry, resources }] of this.data) {
      const rawSource = compilation.assets[entryFilename];

      if (!rawSource) return;

      const importedStyles = [];
      let hasInlineSvg = false;
      let content = rawSource.source();

      for (const asset of resources) {
        const { type, inline, imports, resource } = asset;

        if (inline && type === this.type.inlineSvg) {
          hasInlineSvg = true;
          continue;
        }

        switch (type) {
          case this.type.style:
            if (imports) {
              importedStyles.push(asset);
            } else if (inline) {
              content = this.#inlineStyle(content, resource, asset, LF) || content;
            }
            break;
          case this.type.script:
            content = this.#inlineAndReplaceJS(content, resource, asset, compilation.assets, LF) || content;
            break;
        }
      }

      if (importedStyles.length > 0) {
        content = this.#inlineImportedStyles(content, importedStyles, LF) || content;
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

  /**
   * Insert imported styles in the HTML head.
   *
   * @param {string} content
   * @param {Array<Object>} styles
   * @param {string} LF
   * @return {string|undefined}
   */
  static #inlineImportedStyles(content, styles, LF) {
    const insertPos = this.#findStyleInsertPos(content);
    if (insertPos < 0) {
      // TODO: show warning - the template must contain the <head></head> tag to inject styles.
      return;
    }

    let linkTags = '';
    let styleTags = '';

    for (const asset of styles) {
      if (asset.inline) {
        let source;

        // note: the source can be a string or RawSource
        if (asset.source.source) {
          let sourceMap = asset.source.map();
          source = asset.source.source();

          if (sourceMap) {
            const base64 = Buffer.from(JSON.stringify(sourceMap)).toString('base64');
            source += '\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64 + ' */';
          }
        } else {
          source = asset.source;
        }

        // note: in inlined style must be no LF character after the open tag, otherwise the mapping will not work
        styleTags += `<style>` + source + `</style>${LF}`;
      } else {
        linkTags += `<link href="${asset.assetFile}" rel="stylesheet">${LF}`;
      }
    }

    return content.slice(0, insertPos) + linkTags + styleTags + content.slice(insertPos);
  }

  /**
   * Inline CSS from a style file specified in a template.
   *
   * @param {string} content The content of the template.
   * @param {string} search The original request of a style in the content.
   * @param {Object} asset The object of the style.
   * @param {string} LF The new line feed in depends on the minification option.
   * @return {string|boolean} Return content with inlined CSS or false if the content was not modified.
   */
  static #inlineStyle(content, search, asset, LF) {
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

    // note: in inlined style must be no LF character after the open tag, otherwise the mapping will not work
    return content.slice(0, tagStartPos) + openTag + asset.source + closeTag + content.slice(tagEndPos);
  }

  /**
   * Find insert position for styles in the HTML head.
   *
   * <head>
   *   <title></title>
   *   <link rel="icon">
   *   <link rel="stylesheet">
   *   <style></style>
   *      <-- inject styles here
   *   <script></script>
   * </head>
   *
   * @param {string} content
   * @return {number}
   */
  static #findStyleInsertPos(content) {
    let headStartPos = content.indexOf('<head');
    if (headStartPos < 0) {
      return -1;
    }

    let headEndPos = content.indexOf('</head>', headStartPos);
    if (headEndPos < 0) {
      return -1;
    }

    let startPos = content.indexOf('<script', headStartPos);
    if (startPos < 0 || startPos > headEndPos) {
      startPos = headEndPos;
    }

    return startPos;
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
    const { assets, assetsInfo, chunks, chunkGraph, namedChunkGroups } = compilation;
    const splitChunkFiles = new Set();
    const splitChunkIds = new Set();
    const chunkCache = new Map();

    for (let [resource, { type, inline, name, entries }] of this.files) {
      if (type !== this.type.script) continue;

      const entrypoint = namedChunkGroups.get(name);

      // prevent error when in HMR mode after removing a script in the template
      if (!entrypoint) continue;

      const chunkFiles = new Set();

      for (const { id, files } of entrypoint.chunks) {
        for (const file of files) {
          const info = assetsInfo.get(file);

          // when is used dynamic entry in serve/watch mode and
          // after renaming of an entry file the webpack generate additional needles entry file with the `.js` extension
          // in this case, the entrypoint.chunks.files contains a wrong file with the `.html` extension
          // for what we check the asset info, whether the chunk is a javascript
          const isJavascript = 'javascriptModule' in info;

          if (isJavascript && info.hotModuleReplacement !== true) chunkFiles.add(file);
        }
        splitChunkIds.add(id);
      }

      const hasSplitChunks = chunkFiles.size > 1;

      // do flat the Map<string, Set>
      const entryFilenames = new Set();
      for (const value of entries.values()) {
        value.forEach(entryFilenames.add, entryFilenames);
      }

      for (let entryFile of entryFilenames) {
        // let's show an original error
        if (!assets.hasOwnProperty(entryFile)) continue;

        const data = { type, inline, resource, chunks: [] };
        let injectedChunks;

        if (hasSplitChunks) {
          if (!chunkCache.has(entryFile)) chunkCache.set(entryFile, new Set());
          injectedChunks = chunkCache.get(entryFile);
        }

        for (let chunkFile of chunkFiles) {
          if (hasSplitChunks) {
            if (injectedChunks.has(chunkFile)) continue;
            injectedChunks.add(chunkFile);
          }

          let assetFile = undefined;
          if (inline === true) {
            AssetTrash.add(chunkFile);
          } else {
            assetFile = Options.getAssetOutputFile(chunkFile, entryFile);
            splitChunkFiles.add(chunkFile);
          }

          data.chunks.push({ chunkFile, assetFile });
        }

        const entryData = this.data.get(entryFile);

        if (entryData) {
          entryData.resources.push(data);
        }
      }
    }

    const chunkIds = Array.from(splitChunkIds);

    // remove generated unused split chunks
    for (let { ids, files, chunkReason } of chunks) {
      if (ids.length === 0 || !this.isSplitChunk(chunkReason)) continue;
      for (let file of files) {
        if (splitChunkFiles.has(file)) continue;

        if (chunkIds.find((id) => ids.indexOf(id) > -1)) {
          AssetTrash.add(file);
        }
      }
    }
  }

  static isSplitChunk(reason) {
    return reason != null && reason.indexOf('split') > -1;
  }

  /**
   * Clear cache.
   * Called only once when the plugin is applied.
   */
  static clear() {
    this.index = {};
    this.data.clear();
    this.files.clear();
    this.orderedResources.clear();
    this.importStyleRootIssuers.clear();
    this.importStyleSources.clear();
    this.importStyleIdx = 1000;
  }

  /**
   * Reset settings.
   * Called before each new compilation after changes, in the serve/watch mode.
   */
  static reset() {
    // don't clear the index
    // test case:
    // there are 3 entries: home.html, news.html and about.html
    // 1. add the `script.js` to the home.html => script.js
    // 2. add the `script.js` to the news.html => script.1.js
    // 3. add the `script.js` to the about.html => script.2.js
    // but when the index is cleared, then after adding the file with the same name will be not unique
    // and is generated a js file having a wrong content
    //this.index = {};

    // don't delete entry data, clear only resources
    this.data.forEach((item, key) => {
      if (item.resources != null) item.resources.length = 0;
    });

    // don't delete files, clear only assets
    this.files.forEach((item, key) => {
      if (item.assets != null) item.assets.length = 0;
    });

    this.importStyleRootIssuers.clear();
    this.importStyleSources.clear();
  }

  /**
   * Called right before an entry template will be processed.
   *
   * This is used to reset cached data before the processing of the entry template.
   *
   * @param {Number} entryId
   */
  static beforeProcessTemplate(entryId) {
    // clear cache only if a template is changed, but not a style or others assets,
    // when changing the style, the data must be got from the cache
    this.orderedResources.get(entryId)?.clear();
  }
}

module.exports = Collection;
