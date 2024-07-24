const path = require('path');
const { replaceAll } = require('../Common/Helpers');
const Option = require('./Option');
const AssetEntry = require('./AssetEntry');
const CssExtractModule = require('./Modules/CssExtractModule');
const AssetInline = require('./AssetInline');
const AssetTrash = require('./AssetTrash');
const Preload = require('./Preload');
const Dependency = require('../Loader/Dependency');
const { noHeadException } = require('./Messages/Exception');

const Integrity = require('./Extras/Integrity');
const { HtmlParser, comparePos } = require('../Common/HtmlParser');
const { minify } = require('html-minifier-terser');

/** @typedef {import('webpack').Compilation} Compilation */

/**
 * @typedef {Object} CollectionData
 * @property {string} type The type of resource.
 * @property {boolean} inline Whether should be inlined into HTML.
 * @property {boolean|undefined?} imported Whether the style is imported in JavaScript, if the type is 'style'.
 * @property {{resource: string}} issuer The resource of issuer, only if imported is true.
 * @property {string|Array<{resource: string, assets: Array<CollectionData>}>} resource The resource file, including a query, only if imported is false.
 *  If imported is true, then the resource is the array of imported source files.
 * @property {string|null} assetFile The output filename, only if imported is false.
 * @property {Array<CollectionData>?} assets The assets containing in style or script.
 */

/**
 * Collection of script and style files parsed in a template.
 */

class Collection {
  /** @type {Compilation} */
  static compilation;

  /** @type {AssetEntry} */
  static assetEntry;

  static assets = new Map();

  /** @type {Map<string, {entry: AssetEntryOptions, assets: Array<{}>} >} Entries data */
  static data = new Map();

  // TODO: implement
  /** @type {Map<string, string | Array<string>>} The map of source file to output file */
  static manifest = new Map();

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
      filenameTemplate: Option.getJs().filename,
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
        // note: void elements don't need the closing
        // https://html.spec.whatwg.org/multipage/syntax.html#void-elements
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

    const { attributeFilter } = Option.getJs().inline;

    const sources = this.compilation.assets;
    const { chunks } = asset;
    let openTag = '<script>';
    const closeTag = '</script>';
    const tagStartCode = '<'.charCodeAt(0);
    const attrPos = openTag.length;

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

    // find the starting position of the tag to the left of the `src` attribute
    while (tagStartPos >= 0 && content.charCodeAt(--tagStartPos) !== tagStartCode) {}
    tagEndPos = content.indexOf(closeTag, tagEndPos) + closeTag.length;

    let beforeTagSrc = content.slice(tagStartPos, srcStartPos);
    let afterTagSrc = content.slice(srcEndPos, tagEndPos);
    let isCreatedOpenTag = false;

    for (let { inline, chunkFile, assetFile } of chunks) {
      if (LF && replacement) replacement += LF;

      if (inline) {
        const code = sources[chunkFile].source();

        if (!isCreatedOpenTag && attributeFilter) {
          const { attrs: attributes } = HtmlParser.parseTagAttributes(content, 'script', tagStartPos, attrPos);
          let attrsStr = '';

          for (const [attribute, value] of Object.entries(attributes)) {
            if (attributeFilter({ attributes, attribute, value }) === true) {
              if (attrsStr) attrsStr += ' ';
              attrsStr += attribute;
              if (value != null) attrsStr += `="${value}"`;
            }
          }

          if (attrsStr) {
            openTag = `<script ${attrsStr}>`;
          }

          isCreatedOpenTag = true;
        }

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

    for (let [resource, { type, name, entries }] of this.assets) {
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

          const assetFile = Option.getAssetOutputFile(chunkFile, entryFile);
          const inline = Option.isInlineJs(resource, chunkFile);

          splitChunkFiles.add(chunkFile);
          data.chunks.push({ inline, chunkFile, assetFile });
        }

        const entryData = this.data.get(entryFile);

        if (entryData) {
          entryData.assets.push(data);
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
   * @param {AssetEntry} assetEntry
   * @param {HtmlBundlerPlugin.Hooks} hooks
   */
  static init({ compilation, assetEntry, hooks }) {
    this.compilation = compilation;
    this.assetEntry = assetEntry;
    this.hooks = hooks;
  }

  /**
   * Whether the output filename is a template entrypoint.
   *
   * @param {string} assetFile The asset output file.
   * @return {boolean}
   */
  static isTemplate(assetFile) {
    const data = this.data.get(assetFile);
    return data?.entry.isTemplate === true;
  }

  /**
   * Whether the collection contains the script file.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  static hasScript(resource) {
    return this.assets.get(resource)?.type === this.type.script;
  }

  /**
   * Whether the collection contains the style file.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  static hasStyle(resource) {
    return this.assets.get(resource)?.type === this.type.style;
  }

  /**
   * Whether resource is an inlined style.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  static isInlineStyle(resource) {
    const item = this.assets.get(resource);

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
   * Get entry data by output asset filename.
   *
   * @param {string} assetFile The output asset filename.
   * @return {{entry: AssetEntryOptions, assets: Array<{}>}}
   */
  static getEntry(assetFile) {
    const data = this.data.get(assetFile);

    return data?.entry.isTemplate === true ? data : null;
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
   * Find styles from all nested JS files.
   *
   * @param {number} entryId The entry id of the template where is the root issuer.
   *  Note: the same issuer can be used in many entries.
   * @param {string} rootIssuer The root JS file loaded in template.
   * @param {Object} chunk
   * @return {Object[]}
   */
  static findImportedModules(entryId, rootIssuer, chunk) {
    const issuerModule = this.getGraphModule(rootIssuer);
    const modules = this.findModuleDependencies(issuerModule);

    // reserved for debug;
    // the modules are already sorted
    //modules.sort((a, b) => (a.order < b.order ? -1 : 1));

    return modules;
  }

  /**
   * @param {Module} module The Webpack compilation module.
   * @returns {Array<{order: string, module: Module}>}
   */
  static findModuleDependencies(module) {
    const { moduleGraph } = this.compilation;
    const circularDependencyIds = new Set();
    const orderStack = [];
    let order = '';

    const walk = (module) => {
      // dependencies contains modules from normal imports, e.g. import './main.js'
      // blocks contains modules from dynamic imports, e.g. import('./main.js')
      const { dependencies, blocks } = module;
      const result = [];
      let allDependencies = dependencies;

      // avoid an infinity walk by circular dependency
      if (circularDependencyIds.has(module.debugId)) {
        return result;
      }
      circularDependencyIds.add(module.debugId);

      // add dynamic imports
      if (blocks.length > 0) {
        for (const block of blocks) {
          if (block.dependencies.length > 0) {
            allDependencies = allDependencies.concat(block.dependencies);
          }
        }
      }

      for (const dependency of allDependencies) {
        // TODO: detect whether the userRequest is a file, not a runtime, e.g. of vue
        if (
          !dependency.userRequest ||
          // skip vue runtime dependencies
          dependency.userRequest === 'vue'
        ) {
          continue;
        }

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

        const index = moduleGraph.getParentBlockIndex(dependency);

        if (depModule.resourceResolveData?._bundlerPluginMeta.isImportedStyle === true) {
          result.push({
            resource: depModule.resource,
            order: order + (order ? '.' : '') + index,
            module: depModule,
          });
        } else if (depModule.dependencies.length > 0 || depModule.blocks.length > 0) {
          // save current order before recursive walking
          orderStack.push(order);
          order += (order ? '.' : '') + index;
          result.push(...walk(depModule));
        }
      }

      // recovery order
      order = orderStack.pop();

      return result;
    };

    return walk(module);
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
    for (const item of this.assets.values()) {
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
    let item = this.assets.get(resource);
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
        name = this.assets.get(resource)?.name;

        if (!name) {
          name = this.createUniqueName(resource);
          this.#addToCompilation({ name, resource, issuer });
        }

        inline = undefined;
        break;

      case this.type.style:
        inline = Option.isInlineCss(resource);
        break;

      default:
      // do nothing
    }

    if (!item) {
      item = {
        // type of resource, 'script' or 'style'
        type: type,
        // whether resource should be inlined in HTML
        inline,
        // entry name, defined only if resource is specified in Webpack entry
        name,
        // the key is an entry source request where the resource is loaded
        // the value are entry output filenames to match entry in compilation.assets
        entries: new Map(),
        assets: [],
      };
      this.assets.set(resource, item);
    }
    item.entries.set(issuer, new Set());
  }

  /**
   * Save info of resolved data.
   *
   * Note[1]: resolve the collision when the same issuer, e.g., a style file, is used in many entries.
   *   If an issuer is not inlined, then only by first usage is set the data.
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
    // skip when the resource is defined in the entry option, not in the entry template
    if (!entry) return;

    const { filename } = entry;
    const entryPoint = this.data.get(filename);

    // 1. create entry point
    if (!entryPoint) {
      this.data.set(filename, { entry, assets: [] });
      return;
    }

    const entryAssets = entryPoint.assets;

    if (issuer) data.issuer = issuer;

    // 2. create a style or script
    if (this.ScriptOrStyleType.has(data.type)) {
      // set reference to an original object, because the same resource can be used in many entries
      let ref = this.assets.get(data.resource) || { assets: [] };

      data.refAssets = ref.assets;
      entryAssets.push(data);

      return;
    }

    // 3.1. add assets used in html entry
    if (issuer.resource === entry.resource) {
      entryAssets.push(data);
      return;
    }

    // find a parent asset e.g. style
    const parent = entryAssets.find((item) => item.resource === issuer.resource);

    if (parent) {
      // see the Note[1] in docBlock
      if (!parent.assets) parent.assets = [];

      // 3.2. add assets used in a style
      const assets = parent.inline ? parent.assets : parent.refAssets;
      assets.push(data);
    }
  }

  /**
   * Normalize style assets defined in html assets.
   *
   * When output CSS is a file, then is used a reference to the assets for later adding the resources.
   * We use the reference, because the same asset can be used in many pages, but the Webpack generates only one module.
   * So, using the reference, we have access to all copies of the asset in all pages.
   * When CSS is inlined into HTML, then is used local copy of assets.
   *
   * This method renames referenced property with the `asset` name.
   */
  static #normalizeData() {
    for (const [, { assets }] of this.data) {
      for (const item of assets) {
        if (item.refAssets != null) {
          if (item.refAssets?.length > 0) {
            item.assets = item.refAssets;
          }
          delete item.refAssets;
        }
      }
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

    const item = entryPoint.assets.find(({ resource }) => resource === assetInfo.resource);

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
    this.assets.delete(resource);

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

      this.assets.forEach((item, file) => {
        item.entries.delete(resource);
      });

      AssetTrash.add(filename);
    });

    Dependency.removeFile(resource);
  }

  /**
   * Disconnect entry in all assets.
   *
   * @param {string} resource The file of entry.
   */
  static disconnectEntry(resource) {
    for (const [, item] of this.assets) {
      item.entries.delete(resource);
    }
  }

  /**
   * Render all resolved assets in contents.
   * Inline JS, CSS, substitute output JS filenames.
   *
   * @return {Promise<Awaited<unknown>[]>|Promise<unknown>}
   */
  static render() {
    const compilation = this.compilation;
    const { RawSource } = compilation.compiler.webpack.sources;
    const LF = Option.getLF();
    const isIntegrity = Option.isIntegrityEnabled();

    const hooks = this.hooks;
    const promises = [];

    this.#normalizeData();
    this.#prepareScriptData();

    // TODO: update this.data.assets[].asset.resource after change the filename in a template
    //  - e.g. src="./main.js?v=1" => ./main.js?v=123 => WRONG filename is replaced
    for (const [entryFilename, { entry, assets }] of this.data) {
      const rawSource = compilation.assets[entryFilename];

      if (!rawSource) {
        // the asset in which the compilation error occurred is missing in the compilation.assets
        // in this case return resolved promise to keep the original error message
        return Promise.resolve();
      }

      const entryDirname = path.dirname(entryFilename);
      const importedStyles = [];
      const parseOptions = new Map();
      const assetIntegrity = new Map();
      let hasInlineSvg = false;
      let content = rawSource.source();

      /** @type {CompileEntry} */
      const compileEntry = {
        name: entry.originalName,
        assetFile: entry.filename,
        sourceFile: entry.sourceFile,
        resource: entry.resource,
        outputPath: entry.outputPath,
        assets,
      };

      /** @type {TemplateInfo} */
      const templateInfo = {
        name: entry.originalName,
        assetFile: entry.filename,
        resource: entry.resource,
        sourceFile: entry.sourceFile,
        outputPath: entry.outputPath,
      };

      // 1. postprocess hook
      let promise = Promise.resolve(content).then((value) => hooks.postprocess.promise(value, templateInfo) || value);

      // 2. postprocess callback
      if (Option.hasPostprocess()) {
        // TODO:  update readme for postprocess
        promise = promise.then((value) => Option.postprocess(value, templateInfo, this.compilation) || value);
      }

      // 3. minify HTML before inlining JS and CSS to avoid:
      //    - needles minification already minified assets in production mode
      //    - issues by parsing the inlined JS/CSS code with the html minification module
      if (Option.isMinify()) {
        promise = promise.then((value) => minify(value, Option.get().minifyOptions));
      }

      // 4. inline JS and CSS
      promise = promise.then((content) => {
        // TODO:
        //  - style: rename output filename `assetFile` into filename or assetFilename
        //  - style: add additional filed - assetFile as asset path relative to output.path, not to issuer
        //  - script: rename assetFile -> assetFilename; chunkFile -> assetFile
        for (const asset of assets) {
          const { type, inline, imported, resource } = asset;

          if (inline && type === this.type.inlineSvg) {
            hasInlineSvg = true;
            continue;
          }

          switch (type) {
            case this.type.style:
              if (imported) {
                importedStyles.push(asset);
              } else if (inline) {
                content = this.#inlineStyle(content, resource, asset, LF) || content;
              } else {
                // special use case for Pug only e.g.: style(scope='some')=require('./component.css?include')
                const [, query] = resource.split('?');
                const isIncluded = query?.includes('include');
                if (isIncluded) {
                  const startPos = content.indexOf(asset.assetFile);
                  if (startPos > 0) {
                    const source = CssExtractModule.getInlineSource(asset.assetFile);
                    content = content.slice(0, startPos) + source + content.slice(startPos + asset.assetFile.length);
                  }
                }
              }

              // 1.1 compute CSS integrity
              if (isIntegrity && !inline) {
                // path to asset relative by output.path
                let pathname = asset.assetFile;
                if (Option.isAutoPublicPath()) {
                  pathname = path.join(entryDirname, pathname);
                } else if (Option.isRootPublicPath()) {
                  pathname = pathname.slice(1);
                }

                const assetContent = compilation.assets[pathname].source();
                asset.integrity = Integrity.getIntegrity(compilation, assetContent, pathname);
                assetIntegrity.set(asset.assetFile, asset.integrity);

                if (!parseOptions.has(type)) {
                  parseOptions.set(type, {
                    tag: 'link',
                    attributes: ['href'],
                    filter: ({ attribute, attributes }) =>
                      !attributes.hasOwnProperty('integrity') &&
                      attribute === 'href' &&
                      attributes.rel === 'stylesheet',
                  });
                }
              }
              break;
            case this.type.script:
              // 1.2 compute JS integrity
              if (isIntegrity) {
                for (const chunk of asset.chunks) {
                  if (!chunk.inline) {
                    const assetContent = compilation.assets[chunk.chunkFile].source();
                    chunk.integrity = Integrity.getIntegrity(compilation, assetContent, chunk.chunkFile);
                    assetIntegrity.set(chunk.assetFile, chunk.integrity);

                    if (!parseOptions.has(type)) {
                      parseOptions.set(type, {
                        tag: 'script',
                        attributes: ['src'],
                        filter: ({ attribute, attributes }) =>
                          !attributes.hasOwnProperty('integrity') && attribute === 'src',
                      });
                    }
                  }
                }
              }

              content = this.#bindScript(content, resource, asset, LF) || content;
              break;
          }
        }

        return content;
      });

      // 5. inject styles imported in JS
      promise = promise.then((content) =>
        importedStyles.length > 0 ? this.#bindImportedStyles(content, entry, importedStyles, LF) || content : content
      );

      // 6. inline SVG
      promise = promise.then((content) => (hasInlineSvg ? AssetInline.inlineSvg(content, entryFilename) : content));

      // 7. inject preloads
      if (Option.isPreload()) {
        promise = promise.then((content) => Preload.insertPreloadAssets(content, entry.filename, this.data) || content);
      }

      // 8. inject integrity
      if (isIntegrity) {
        promise = promise.then((content) => {
          // 2. parse generated html for `link` and `script` tags
          const parsedResults = [];

          for (const opts of parseOptions.values()) {
            parsedResults.push(...HtmlParser.parseTag(content, opts));
          }
          parsedResults.sort(comparePos);

          // 3. include the integrity attributes in the parsed tags
          let pos = 0;
          let output = '';

          for (const { tag, parsedAttrs, attrs, startPos, endPos } of parsedResults) {
            if (!attrs || parsedAttrs.length < 1) continue;

            const assetFile = attrs.href || attrs.src;
            const integrity = assetIntegrity.get(assetFile);

            if (integrity) {
              attrs.integrity = integrity;
              attrs.crossorigin = Option.webpackOptions.output.crossOriginLoading || 'anonymous';

              let attrsStr = '';
              for (const attrName in attrs) {
                attrsStr += ` ${attrName}="${attrs[attrName]}"`;
              }

              output += content.slice(pos, startPos) + `<${tag}${attrsStr}>`;
              pos = endPos;
            }
          }

          return output + content.slice(pos);
        });
      }

      // 9. beforeEmit hook allows plugins to change the html after chunks and inlined assets are injected
      promise = promise.then((content) => hooks.beforeEmit.promise(content, compileEntry) || content);

      // 10. beforeEmit callback
      if (Option.hasBeforeEmit()) {
        promise = promise.then((content) => Option.beforeEmit(content, compileEntry, compilation) || content);
      }

      // update HTML content
      promise = promise.then((content) => {
        if (typeof content === 'string') {
          compilation.updateAsset(entryFilename, new RawSource(content));
        }
      });

      promises.push(promise);
    }

    return Promise.all(promises);
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
    this.assets.clear();
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

    // don't delete entry data, clear only assets
    this.data.forEach((item, key) => {
      if (item.assets != null) item.assets = [];
    });

    // don't delete files, clear only assets
    this.assets.forEach((item, key) => {
      if (item.assets != null) item.assets = [];
    });

    this.importStyleRootIssuers.clear();
    this.importStyleSources.clear();
  }

  /* istanbul ignore next: test it manual using `cache.type` as `filesystem` after 2nd run the same project */
  /**
   * Called by first start or after changes.
   *
   * @param {Function} write The serialize function.
   */
  static serialize({ write }) {
    for (let [, { entry }] of this.data) {
      // note: set the function properties as null to able the serialization of the entry object,
      // the original functions will be recovered by deserialization from the cached object `AssetEntry`
      entry.filenameFn = null;
      entry.filenameTemplate = null;
    }

    write(this.assets);
    write(this.data);
  }

  /* istanbul ignore next: test it manual using `cache.type` as `filesystem` after 2nd run the same project */
  /**
   * @param {Function} read The deserialize function.
   */
  static deserialize({ read }) {
    this.assets = read();
    this.data = read();

    for (let [, { entry }] of this.data) {
      const cachedEntry = this.assetEntry.entriesById.get(entry.id);

      // recovery original not serializable functions from the object cached in the memory
      entry.filenameFn = cachedEntry.filenameFn;
      entry.filenameTemplate = cachedEntry.filenameTemplate;
    }

    this.isDeserialized = true;
  }

  /* istanbul ignore next: test it manual using `cache.type` as `filesystem` after 2nd run the same project */
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
    for (const [resource, item] of this.assets) {
      const { type, name, entries } = item;

      if (type === this.type.script && entries.has(issuer)) {
        this.#addToCompilation({ name, resource, issuer });
      }
    }
  }
}

module.exports = Collection;
