const path = require('path');
const Collection = require('./Collection');
const { resolveException } = require('./Messages/Exception');
const Snapshot = require('./Snapshot');

class Resolver {
  fs = null;

  /**
   * @type {string} The issuer filename of required the file.
   */
  issuerFile = '';

  /**
   * @type {FileInfo} The issuer of required the file.
   */
  issuer = {};

  /**
   * @type {AssetEntryOptions} The current entry point where are resolved all dependencies.
   */
  entryPoint = {};

  /**
   * @type {string} The context directory of required the file.
   */
  context = '';

  /**
   * The cache of resolved source files. Defined at one time.
   *
   * @type {Map<string, Map<string, string>>}
   */
  sourceFiles = new Map();

  /**
   * The data of assets to resolving output assets.
   * For each new chunk must be cleaned.
   * Note: the same module can have many issuers and can be saved under different asset filenames.
   *
   * @type {Map<string, {assets:Map, originalFilename?:string, resolve?:(issuer:FileInfo) => string}>}
   */
  data = new Map();

  pluginOption = null;
  collection = null;
  assetEntry = null;
  assetInline = null;

  constructor({ pluginOption, assetEntry, assetInline, collection }) {
    this.pluginOption = pluginOption;
    this.collection = collection;
    this.assetEntry = assetEntry;
    this.assetInline = assetInline;
  }

  /**
   * @param {FileSystem} fs
   */
  init({ fs }) {
    this.fs = fs;
    // webpack root context path
    this.rootContext = this.pluginOption.context;

    // bind this context to the method for using in VM context
    this.require = this.require.bind(this);
  }

  /**
   * Set the current issuer and the entry point.
   *
   * @param {Object} entryPoint The current entry point.
   * @param {FileInfo} issuer The issuer.
   */
  setContext(entryPoint, issuer) {
    const [file] = issuer.resource.split('?', 1);
    this.context = path.dirname(file);
    this.entryPoint = entryPoint;
    this.issuer = issuer;
    this.issuerFile = file;
  }

  /**
   * Add the context and resolved path of the resource to resolve it in require() at render time.
   *
   * @param {{resource: string, filename: string, resolve?: (FileInfo)=> string}} assetInfo The asset info.
   */
  addAsset(assetInfo) {
    let sourceFile = path.resolve(assetInfo.resource);
    let resourceData = this.data.get(sourceFile);

    if (!resourceData) {
      resourceData = {
        assets: new Map(),
        sourceFile,
      };
      this.data.set(sourceFile, resourceData);
    }

    if (assetInfo.resolve) {
      resourceData.resolve = assetInfo.resolve;
    } else {
      resourceData.originalFilename = assetInfo.filename;
    }
  }

  /**
   * Resolve the full path of asset source file.
   *
   * @param {string} rawRequest The raw request of resource.
   * @param {string} issuer The issuer of resource.
   * @return {string|null} The resolved full path of resource.
   */
  resolveResource(rawRequest, issuer) {
    let resource = this.sourceFiles.get(issuer)?.get(rawRequest);
    if (resource) return resource;

    // normalize request, e.g., the relative `path/to/../to/file` path to absolute `path/to/file`
    resource = path.resolve(this.context, rawRequest);
    const [file] = resource.split('?', 1);

    if (rawRequest.startsWith(this.context) || this.fs.existsSync(file)) {
      this.addSourceFile(resource, rawRequest, issuer);

      return resource;
    }

    return null;
  }

  /**
   * Add resolved source file to data.
   *
   * @param {string} sourceFile The resolved full path of resource.
   * @param {string} rawRequest The rawRequest of resource.
   * @param {string} issuer The issuer of resource.
   */
  addSourceFile(sourceFile, rawRequest, issuer) {
    let item = this.sourceFiles.get(issuer);
    if (item == null) {
      this.sourceFiles.set(issuer, new Map([[rawRequest, sourceFile]]));
    } else {
      item.set(rawRequest, sourceFile);
    }
  }

  /**
   * Get the key of asset file to save it as resolved under its issuer.
   *
   * Note: the key can be an output filename when the issuer is a current entry point
   *  otherwise is a source file of an issuer, e.g., a style.
   *
   * @param {string} issuer
   * @param {AssetEntryOptions} entryPoint
   */
  getAssetKey(issuer, entryPoint) {
    return issuer === entryPoint?.resource ? entryPoint.filename : issuer;
  }

  /**
   * Resolve output filename, given the auto public path.
   * Resolves styles, images, fonts and others except scripts.
   *
   * @param {string} resource The resource file, including a query.
   * @return {string|null}
   */
  resolveAsset(resource) {
    const resourceData = this.data.get(resource);

    if (!resourceData) return null;

    const { entryPoint, issuer } = this;
    const assetKey = this.getAssetKey(issuer.resource, entryPoint);
    const assetFile = resourceData.assets.get(assetKey);
    const isIssuerInlinedStyle = this.collection.isInlineStyle(issuer.resource);

    if (assetFile && !isIssuerInlinedStyle) return assetFile;

    const { originalFilename, resolve } = resourceData;
    const realIssuer = isIssuerInlinedStyle
      ? {
          resource: entryPoint.resource,
          filename: entryPoint.filename,
        }
      : issuer;
    let outputFilename;

    if (originalFilename != null) {
      outputFilename = this.pluginOption.getOutputFilename(originalFilename, realIssuer.filename);
    } else if (resolve != null) {
      // resolve asset filename processed via external loader, e.g. `responsive-loader`
      outputFilename = resolve(realIssuer);
    }

    if (outputFilename != null) {
      resourceData.assets.set(assetKey, outputFilename);

      if (this.collection.hasStyle(resource)) {
        // set the output filename for already created (in renderManifest) data
        this.collection.setResourceFilename(this.entryPoint, { resource, filename: outputFilename });
      } else {
        this.collection.setData(this.entryPoint, issuer, {
          type: Collection.type.resource,
          inline: false,
          resource,
          assetFile: outputFilename,
        });
      }
    }

    return outputFilename;
  }

  /**
   * Require the resource request in the compiled template or CSS.
   *
   * @param {string} rawRequest The raw request of source resource.
   * @returns {string} The output asset filename generated by filename template.
   * @throws {Error}
   */
  require(rawRequest) {
    const { issuer, issuerFile } = this;

    // @import CSS rule is not supported
    if (rawRequest.includes('??ruleSet')) {
      resolveException(rawRequest, issuer.resource, this.rootContext, this.pluginOption);
    }

    // bypass the asset contained data-URL
    if (this.assetInline.isDataUrl(rawRequest)) return rawRequest;

    // bypass the source script file to replace it after the process
    if (this.collection.hasScript(rawRequest)) return rawRequest;

    // bypass the inline CSS
    if (this.collection.isInlineStyle(rawRequest)) return rawRequest;

    const resource = this.resolveResource(rawRequest, issuerFile);

    // resolve resource
    if (resource != null) {
      // bypass the asset/inline as inline SVG
      if (this.pluginOption.isEntry(issuer.resource) && this.pluginOption.isEmbedSvg(resource)) {
        this.collection.setData(this.entryPoint, issuer, {
          type: Collection.type.inlineSvg,
          inline: true, // embed into DOM by replacing <img> with <svg>
          resource,
        });

        return resource;
      }

      const assetFile = this.resolveAsset(resource);

      if (assetFile != null) return assetFile;

      // try to resolve inline data url
      const dataUrl = this.assetInline.getDataUrl(resource, issuerFile);

      if (dataUrl != null) {
        this.collection.setData(this.entryPoint, issuer, {
          type: Collection.type.resource,
          inline: true,
          resource,
        });
        return dataUrl;
      }
    }

    // if is used the filename like `./main.js`, then the resource is an absolute file
    // if is used the filename like `../js/main.js`, then the resource is null and the rawRequest is an absolute file
    const file = resource || rawRequest;
    if (this.pluginOption.js.test.test(file) && this.assetEntry.isEntryResource(issuer.resource)) {
      // occur after rename/delete of a js file when the entry module was already rebuilt
      Snapshot.addMissingFile(issuer.resource, file);
      resolveException(file, issuer.resource, this.rootContext, this.pluginOption);
    }

    // require a native JavaScript, JSON or css-loader API file
    if (/\.js[a-z0-9]*$/i.test(resource)) return require(resource);

    resolveException(rawRequest, issuer.resource, this.rootContext, this.pluginOption);
  }

  /**
   * Clear caches.
   * Called only once when the plugin is applied.
   */
  clear() {
    this.data.clear();
    this.sourceFiles.clear();
  }

  /**
   * Reset settings.
   * Called before each new compilation after changes, in the serve/watch mode.
   */
  reset() {
    // reset outdated assets after rebuild via webpack dev server
    // note: new filenames are generated on the fly in the this.resolveAsset() method
    this.data.forEach((item) => item.assets.clear());
  }
}

module.exports = Resolver;
