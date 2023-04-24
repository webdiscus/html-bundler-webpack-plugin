const path = require('path');
const AssetInline = require('./AssetInline');
const Collection = require('./Collection');
const Options = require('./Options');
const { resolveException } = require('./Messages/Exception');

class Resolver {
  static fs = null;

  /**
   * @type {string} The issuer filename of required the file.
   */
  static issuerFile = '';

  /**
   * @type {FileInfo} The issuer of required the file.
   */
  static issuer = {};

  /**
   * @type {AssetEntryOptions} The current entry point where are resolved all dependencies.
   */
  static entryPoint = {};

  /**
   * @type {string} The context directory of required the file.
   */
  static context = '';

  /**
   * The cache of resolved source files. Defined at one time.
   *
   * @type {Map<string, Map<string, string>>}
   */
  static sourceFiles = new Map();

  /**
   * The data of assets to resolving output assets.
   * For each new chunk must be cleaned.
   * Note: the same module can have many issuers and can be saved under different asset filenames.
   *
   * @type {Map<string, {assets:Map, originalFilename?:string, resolve?:(issuer:FileInfo) => string}>}
   */
  static data = new Map();

  /**
   * @param {FileSystem} fs
   * @param {string} rootContext The Webpack root context path.
   */
  static init({ fs, rootContext }) {
    this.fs = fs;
    this.rootContext = rootContext;

    // bind this context to the method for using in VM context
    this.require = this.require.bind(this);
  }

  /**
   * Set the current issuer and the entry point.
   *
   * @param {Object} entryPoint The current entry point.
   * @param {FileInfo} issuer The issuer.
   */
  static setContext(entryPoint, issuer) {
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
  static addAsset(assetInfo) {
    let sourceFile = path.resolve(assetInfo.resource);
    let item = this.data.get(sourceFile);

    if (!item) {
      item = {
        assets: new Map(),
        sourceFile,
      };
      this.data.set(sourceFile, item);
    }

    if (assetInfo.resolve) {
      item.resolve = assetInfo.resolve;
    } else {
      item.originalFilename = assetInfo.filename;
    }
  }

  /**
   * Resolve the full path of asset source file by raw request and issuer.
   *
   * @param {string} rawRequest The raw request of resource.
   * @param {string} issuer The issuer of resource.
   * @return {string|null} The resolved full path of resource.
   */
  static getSourceFile(rawRequest, issuer) {
    let sourceFile = this.sourceFiles.get(issuer)?.get(rawRequest);
    if (sourceFile) return sourceFile;

    // normalize request, e.g. the relative `path/to/../to/file` path to absolute `path/to/file`
    sourceFile = path.resolve(this.context, rawRequest);
    const [file] = sourceFile.split('?', 1);

    if (rawRequest.startsWith(this.context) || this.fs.existsSync(file)) {
      this.addSourceFile(sourceFile, rawRequest, issuer);
      return sourceFile;
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
  static addSourceFile(sourceFile, rawRequest, issuer) {
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
   *  otherwise is a source file of an issuer, e.g. a style.
   *
   * @param {string} issuer
   * @param {AssetEntryOptions} entryPoint
   */
  static getAssetKey(issuer, entryPoint) {
    return issuer === entryPoint.resource ? entryPoint.filename : issuer;
  }

  /**
   * Resolve output filename, given the auto public path.
   * Resolves styles, images, fonts and others except scripts.
   *
   * @param {string} resource The resource file, including a query.
   * @return {string|null}
   */
  static resolveAsset(resource) {
    const item = this.data.get(resource);

    if (!item) return null;

    const { entryPoint, issuer } = this;
    const assetKey = this.getAssetKey(issuer.resource, entryPoint);
    const assetFile = item.assets.get(assetKey);
    const isIssuerInlinedStyle = Collection.isInlineStyle(issuer.resource);

    if (assetFile && !isIssuerInlinedStyle) return assetFile;

    const { originalFilename, resolve } = item;
    let outputFilename;

    if (originalFilename != null) {
      const issuerFilename = isIssuerInlinedStyle ? entryPoint.filename : issuer.filename;
      outputFilename = Options.getAssetOutputFile(originalFilename, issuerFilename);
    } else if (resolve != null) {
      // resolve asset filename processed via external loader, e.g. `responsive-loader`
      outputFilename = resolve(issuer);
    }

    if (outputFilename != null) {
      item.assets.set(assetKey, outputFilename);

      if (Collection.isStyle(resource)) {
        // set the output filename for already created (in renderManifest) data
        Collection.setDataFilename(this.entryPoint, { resource, filename: outputFilename });
      } else {
        Collection.setData(this.entryPoint, issuer, {
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
  static require(rawRequest) {
    const { issuerFile, issuer } = this;

    // @import CSS rule is not supported
    if (rawRequest.indexOf('??ruleSet') > 0) {
      resolveException(rawRequest, issuer.resource);
    }

    // bypass the asset contained data-URL
    if (AssetInline.isDataUrl(rawRequest)) return rawRequest;

    // bypass the source script file to replace it after the process
    if (Collection.isScript(rawRequest)) return rawRequest;

    const resource = this.getSourceFile(rawRequest, issuerFile);

    // bypass the asset/inline as inline SVG
    if (resource && AssetInline.isInlineSvg(resource, issuerFile)) {
      Collection.setData(this.entryPoint, issuer, {
        type: Collection.type.inlineSvg,
        inline: true,
        resource,
      });
      return resource;
    }

    // bypass the inline CSS
    if (Collection.isInlineStyle(rawRequest)) return rawRequest;

    // resolve resource
    if (resource != null) {
      const assetFile = this.resolveAsset(resource);

      if (assetFile != null) return assetFile;

      // try to resolve inline data url
      const dataUrl = AssetInline.getDataUrl(resource, issuerFile);
      if (dataUrl != null) {
        Collection.setData(this.entryPoint, issuer, { type: Collection.type.resource, inline: true, resource });
        return dataUrl;
      }
    }

    // require only js code or json data
    if (/\.js[a-z0-9]*$/i.test(rawRequest)) return require(resource);

    resolveException(rawRequest, issuer.resource);
  }

  /**
   * Clear caches.
   * Called only once when the plugin is applied.
   */
  static clear() {
    this.data.clear();
    this.sourceFiles.clear();
  }

  /**
   * Reset settings.
   * Called before each new compilation after changes, in the serv/watch mode.
   */
  static reset() {
    // reset outdated assets after rebuild via webpack dev server
    // note: new filenames are generated on the fly in the this.resolveAsset() method
    this.data.forEach((item) => item.assets.clear());
  }
}

module.exports = Resolver;
