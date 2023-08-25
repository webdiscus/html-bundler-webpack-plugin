const path = require('path');
const { replaceAll } = require('../Common/Helpers');
const Options = require('./Options');
const AssetEntry = require('./AssetEntry');
const CssExtractModule = require('./Modules/CssExtractModule');
const AssetInline = require('./AssetInline');
const AssetTrash = require('./AssetTrash');
const Preload = require('./Preload');
const Dependency = require('../Loader/Dependency');
const { noHeadException } = require('./Messages/Exception');

/** @typedef {import('webpack').Compilation} Compilation */

/**
 * @typedef {Object} CollectionData
 * @property {string} type The type of resource.
 * @property {boolean} inline Whether should be inlined into HTML.
 * @property {boolean} imported Whether the style is imported in JavaScript, if the type is 'style'.
 * @property {Array<CollectionData>|null} imports The imported styles in one JS file.
 * @property {string} issuer The resource of issuer, only if imports are not null.
 * @property {string} resource The resource file, including a query, only if imported is false.
 * @property {string|null} assetFile The output filename, only if imported is false.
 */

/**
 * Collection of script and style files parsed in a template.
 */

class Collection {
  /** @type {Compilation} */
  static compilation;

  // resource files
  static files = new Map();

  /** @type {Map<string, {entry: AssetEntryOptions, resources: Array<{}>} >} Entries data */
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
  static isDeserialized = false;

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

  /**
   * @param {string} name
   * @param {string} resource
   * @param {string} issuer
   */
  static #addToCompilation({ name, resource, issuer }) {
    const entry = {
      name,
      importFile: resource,
      filenameTemplate: Options.getJs().filename,
      context: path.dirname(issuer),
      issuer,
    };

    AssetEntry.addToCompilation(entry);
  }

  /**
   * Binding of compiled styles imported in JavaScript to generated HTML.
   *
   * The CSS will be inlined or an output filename will be injected in content.
   *
   * @param {string} content The content of the template.
   * @param {AssetEntryOptions} entry
   * @param {Array<Object>} styles
   * @param {string} LF The new line feed in depends on the minification option.
   * @return {string|undefined}
   */
  static #bindImportedStyles(content, entry, styles, LF) {
    const insertPos = this.findStyleInsertPos(content);
    if (insertPos < 0) {
      noHeadException(entry.resource);
    }

    let linkTags = '';
    let styleTags = '';

    for (const asset of styles) {
      if (asset.inline) {
        const source = CssExtractModule.getInlineSource(asset.assetFile);

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

    const source = CssExtractModule.getInlineSource(asset.assetFile);
    const tagEnd = '>';
    const openTag = '<style>';
    let closeTag = '</style>';
    let tagStartPos = pos;
    let tagEndPos = pos + search.length;

    while (tagStartPos >= 0 && content.charAt(--tagStartPos) !== '<') {}
    tagEndPos = content.indexOf(tagEnd, tagEndPos) + tagEnd.length;

    // add LF after injected scripts when next char is not a new line
    if (LF && !'\n\r'.includes(content[tagEndPos])) closeTag += LF;

    // note: in inlined style must be no LF character after the open tag, otherwise the mapping will not work
    return content.slice(0, tagStartPos) + openTag + source + closeTag + content.slice(tagEndPos);
  }

  /**
   * Binding of compiled JavaScript into generated HTML.
   *
   * The JS will be inlined or source script file will be replaced with output filename in content.
   *
   * @param {string} content The content of the template.
   * @param {string} resource The resource file containing in the content.
   * @param {Object} asset The object of the script.
   * @param {string} LF The new line feed in depends on the minification option.
   * @return {string|boolean} Return content with inlined JS or false if the content was not modified.
   */
  static #bindScript(content, resource, asset, LF) {
    let pos = content.indexOf(resource);
    if (pos < 0) return false;

    const sources = this.compilation.assets;
    const { chunks } = asset;
    const openTag = '<script>';
    const closeTag = '</script>';

    let srcStartPos = pos;
    let srcEndPos = srcStartPos + resource.length;
    let tagStartPos = srcStartPos;
    let tagEndPos = srcEndPos;
    let replacement = '';

    if (chunks.length === 1 && chunks[0].inline !== true) {
      // replace the single chunk file for preload in the `link` tag and in the `script` tag
      // TODO: remove polyfill when support for node.js 14 is dropped
      return String.prototype.replaceAll
        ? content.replaceAll(resource, chunks[0].assetFile)
        : replaceAll(content, resource, chunks[0].assetFile);
    }

    while (tagStartPos >= 0 && content.charAt(--tagStartPos) !== '<') {}
    tagEndPos = content.indexOf(closeTag, tagEndPos) + closeTag.length;

    let beforeTagSrc = content.slice(tagStartPos, srcStartPos);
    let afterTagSrc = content.slice(srcEndPos, tagEndPos);

    for (let { inline, chunkFile, assetFile } of chunks) {
      if (LF && replacement) replacement += LF;

      if (inline) {
        const code = sources[chunkFile].source();
        replacement += openTag + code + closeTag;
        AssetTrash.add(chunkFile);
      } else {
        replacement += beforeTagSrc + assetFile + afterTagSrc;
      }
    }

    // add LF after injected scripts when next char is not a new line
    if (LF && !'\n\r'.includes(content[tagEndPos])) replacement += LF;

    return content.slice(0, tagStartPos) + replacement + content.slice(tagEndPos);
  }

  /**
   * Prepare data for script rendering.
   */
  static #prepareScriptData() {
    const compilation = this.compilation;
    const { assets, assetsInfo, chunks, chunkGraph, namedChunkGroups } = compilation;
    const splitChunkFiles = new Set();
    const splitChunkIds = new Set();
    const chunkCache = new Map();

    for (let [resource, { type, name, entries }] of this.files) {
      if (type !== this.type.script) continue;

      const entrypoint = namedChunkGroups.get(name);

      // prevent error when in watch mode after removing a script in the template
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

        const data = { type, resource, chunks: [] };
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

          const assetFile = Options.getAssetOutputFile(chunkFile, entryFile);
          const inline = Options.isInlineJs(resource, chunkFile);

          splitChunkFiles.add(chunkFile);
          data.chunks.push({ inline, chunkFile, assetFile });
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
      const isSplitChunk = chunkReason != null && chunkReason.indexOf('split') > -1;

      if (ids.length === 0 || !isSplitChunk) continue;

      for (let file of files) {
        if (splitChunkFiles.has(file)) continue;

        if (chunkIds.find((id) => ids.indexOf(id) > -1)) {
          AssetTrash.add(file);
        }
      }
    }
  }

  /**
   * @param {Compilation} compilation
   */
  static init(compilation) {
    this.compilation = compilation;
  }

  /**
   * Whether the output filename is a template entrypoint.
   *
   * @param {string} assetFIle The asset output file.
   * @return {boolean}
   */
  static isTemplate(assetFIle) {
    const item = this.data.get(assetFIle);
    return (item && item.entry.isTemplate) === true;
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
   * @param {string} entryId The entry id where can be used imported styles.
   * @return {boolean}
   */
  static hasImportedStyle(entryId) {
    return this.importStyleRootIssuers.size > 0 && this.orderedResources.has(entryId);
  }

  /**
   * @returns {boolean}
   */
  static isImportStyleEsModule() {
    return this.importStyleEsModule;
  }

  /**
   * @param {boolean} state Whether the style is imported as ESM.
   */
  static setImportStyleEsModule(state) {
    this.importStyleEsModule = state === true;
  }

  /**
   * @param {string} resource
   */
  static getGraphModule(resource) {
    const { moduleGraph } = this.compilation;
    const moduleMap = moduleGraph._moduleMap;

    for (let [module] of moduleMap.entries()) {
      if (module.resource === resource) {
        return module;
      }
    }

    return null;
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
      const { dependencies } = module;
      const result = [];

      for (const dependency of dependencies) {
        if (!dependency.userRequest) continue;

        const parentIndex = moduleGraph.getParentBlockIndex(dependency);
        let depModule = moduleGraph.getModule(dependency);

        if (!depModule) {
          // prevent a potential error in as yet unknown use cases to find the location of the bug
          /* istanbul ignore next */
          continue;
        }

        // use the original NormalModule instead of ConcatenatedModule
        if (!depModule.resource && depModule.rootModule) {
          depModule = depModule.rootModule;
        }

        const { isImportedStyle } = depModule.resourceResolveData._bundlerPluginMeta || {}; // TODO: test

        if (depModule.dependencies.length > 0) {
          // save current order before recursive walking
          orderStack.push(order);
          order += (order ? '.' : '') + parentIndex;
          result.push(...walk(depModule));
        } else if (isImportedStyle) {
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
  static findStyleInsertPos(content) {
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

  /**
   * @param {AssetEntryOptions} entry The entry point object.
   */
  static addEntry(entry) {
    const { isTemplate, resource, filename } = entry;

    if (isTemplate && !this.data.has(filename)) {
      this.setData(entry, null, {});
    }

    // set entry dependencies
    for (const item of this.files.values()) {
      const entryFilenames = item.entries.get(resource);
      if (entryFilenames) {
        entryFilenames.add(filename);
      }
    }
  }

  /**
   * Add the resource.
   * Called in loader by parsing scripts and styles.
   *
   * @param {'script'|'style'} type The type of resource.
   * @param {string} resource The resource file, including a query.
   * @param {string} issuer The issuer resource, including a query.
   * @param {string|number|null} entryId The entry id where is loaded the resource.
   */
  static addResource({ type, resource, issuer, entryId = null }) {
    // note: the same source file can be either as file or as inlined,
    // but can't be in one place as file and in another place as inlined
    let item = this.files.get(resource);
    let inline = false;
    let name;

    switch (type) {
      case this.type.script:
        // Save resources by entry points in the order their location in the source code.
        // Note: the order of script resources is important to inject the style files imported in JS into HTML.
        if (entryId) {
          let orderedResources = this.orderedResources.get(entryId);
          if (!orderedResources) {
            orderedResources = new Set();
            this.orderedResources.set(entryId, orderedResources);
          }
          orderedResources.add(resource);
        }

        // get unique entry name
        name = this.files.get(resource)?.name;

        if (!name) {
          name = this.createUniqueName(resource);
          this.#addToCompilation({ name, resource, issuer });
        }

        inline = undefined;
        break;

      case this.type.style:
        inline = Options.isInlineCss(resource);
        break;

      default:
      // do nothing
    }

    if (!item) {
      item = {
        // entry name, defined only if resource is specified in Webpack entry
        name,
        // type of resource, 'script' or 'style'
        type: type,
        // whether resource should be inlined in HTML
        inline,
        // the key is an entry source request where the resource is loaded
        // the value are entry output filenames to match entry in compilation.assets
        entries: new Map(),
      };
      this.files.set(resource, item);
    }
    item.entries.set(issuer, new Set());
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
   *   by entries with different output paths, e.g.: 'home/' -> 'img/fig.png', 'home/en/' -> '../img/fig.png'.
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

    // for serve/watch mode
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
   * Set resolved output filename of asset.
   *
   * @param {AssetEntryOptions} entry The entry where is specified the resource.
   * @param {FileInfo} assetInfo The asset file info.
   */
  static setResourceFilename(entry, assetInfo) {
    const entryPoint = this.data.get(entry.filename);

    if (!entryPoint) return;

    const item = entryPoint.resources.find(({ resource }) => resource === assetInfo.resource);

    if (item) {
      item.assetFile = assetInfo.filename;
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
   * Render all resolved assets in contents.
   * Inline JS, CSS, substitute output JS filenames.
   *
   * @param {Function} callback A callback that allows content to be modified using an external function.
   */
  static render(callback) {
    const compilation = this.compilation;
    const { RawSource } = compilation.compiler.webpack.sources;
    const LF = Options.getLF();
    const hasCallback = typeof callback === 'function';

    this.#prepareScriptData();

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
            content = this.#bindScript(content, resource, asset, LF) || content;
            break;
        }
      }

      if (importedStyles.length > 0) {
        content = this.#bindImportedStyles(content, entry, importedStyles, LF) || content;
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

  static serialize({ write }) {
    write(this.files);
    write(this.data);
  }

  static deserialize({ read }) {
    this.files = read();
    this.data = read();
    this.isDeserialized = true;
  }

  /**
   * Add the script files loaded in the template to the compilation after deserialization.
   *
   * Called after deserialization when the template module is created.
   * At this stage, missing scripts can be added to the compilation after deserialization,
   * as if they were added to the compilation after parsing the template.
   *
   * @param {string} issuer The template entry file where are loaded deserialized files.
   */
  static addToCompilationDeserializedFiles(issuer) {
    for (const [resource, item] of this.files) {
      const { isCompiled, type, name, entries } = item;
      if (!isCompiled && type === this.type.script && entries.has(issuer)) {
        item.isCompiled = true;
        this.#addToCompilation({ name, resource, issuer });
      }
    }
  }

  /**
   * TODO: Reserved for debug.
   */
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

  /**
   * TODO: Reserved for debug.
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
}

module.exports = Collection;
