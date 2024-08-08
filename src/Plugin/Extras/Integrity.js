const crypto = require('crypto');
const { missingCrossOriginForIntegrityException } = require('../Messages/Exception');

const hashesReference = '__webpack_require__.integrity';

/** @typedef {import('webpack').Compilation} Compilation */

/**
 * Integrity.
 * This class is needed for dynamically imported JS files only.
 */
class Integrity {
  static hashFunctions = [];

  // hash => [Set Iterator] of one asset filename,
  // the `chunk.files` contains only one filename and will have the final value later, than we save it,
  // therefore, we can save only reference to `chunk.files.values()`
  static hashes = new WeakMap();

  // filename => hash, normalized map with final asset filenames
  static assetHashes = new WeakMap();

  constructor(options) {
    this.pluginName = 'html-bundler-integrity-plugin';

    Integrity.hashFunctions = options.getIntegrity().hashFunctions;

    this.options = options;
    this.chunkChildChunksMap = new WeakMap();
    this.referencePlaceholders = new Map();
    this.placeholderByChunkId = new Map();
    this.chunkByChunkId = new Map();
  }

  apply(compiler) {
    const { pluginName } = this;

    compiler.hooks.afterPlugins.tap(pluginName, (compiler) => {
      compiler.hooks.thisCompilation.tap({ name: pluginName, stage: -10000 }, (compilation) => {
        this.compilation = compilation;
        this.init();

        // not documented feature for compatibility with the result of webpack-subresource-integrity plugin;
        // use the comfort `integrityHashes` hook to get assets containing the integrity:
        // HtmlBundlerPlugin.getHooks(compilation).integrityHashes.tapAsync('myPlugin', (hashes) => {})
        compilation.hooks.statsFactory.tap(pluginName, (statsFactory) => {
          const assetHashes = Integrity.getAssetHashes(compilation);

          statsFactory.hooks.extract.for('asset').tap(pluginName, (object, asset) => {
            const integrity = assetHashes.get(asset.name);
            if (integrity) {
              object.integrity = integrity;
            }
          });
        });
      });
    });
  }

  init() {
    const { compilation, pluginName } = this;
    const { mainTemplate } = compilation;
    const { Compilation } = compilation.compiler.webpack;

    if (!compilation.outputOptions.crossOriginLoading) {
      missingCrossOriginForIntegrityException();
    }

    this.isRealContentHash = this.options.isRealContentHash();

    // dynamically import a JS file
    mainTemplate.hooks.jsonpScript.tap(pluginName, (source) => this.addReference('script', source));
    mainTemplate.hooks.linkPreload.tap(pluginName, (source) => this.addReference('link', source));
    mainTemplate.hooks.localVars.tap(pluginName, this.setReferencePlaceholder.bind(this));

    compilation.hooks.beforeRuntimeRequirements.tap(pluginName, () => {
      this.placeholderByChunkId.clear();
    });

    compilation.hooks.processAssets.tap(
      { name: pluginName, stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE },
      this.processAssets.bind(this)
    );

    // the hook works in production mode only
    compilation.compiler.webpack.optimize.RealContentHashPlugin.getCompilationHooks(compilation).updateHash.tap(
      pluginName,
      this.updateHash.bind(this)
    );
  }

  /**
   * Update integrity hash when the chunk content was changed, e.g.,
   * when is added a license banner on the next stage.
   *
   * @param {Array} content
   * @param {string} oldHash
   * @return {undefined|string}
   */
  updateHash(content, oldHash) {
    if (this.placeholderByChunkId.size === 0 || content.length !== 1) return undefined;

    let chunk;
    for (let [chunkId, placeholder] of this.placeholderByChunkId) {
      if (oldHash === placeholder) {
        chunk = this.chunkByChunkId.get(chunkId);
        break;
      }
    }

    return chunk ? Integrity.getIntegrity(this.compilation, content[0], chunk) : undefined;
  }

  processAssets(assets) {
    const { compilation, isRealContentHash } = this;
    const { compiler } = compilation;

    for (const chunk of this.compilation.chunks) {
      const chunkFile = [...chunk.files][0];

      if (!(typeof chunk.runtime === 'string') || !chunkFile.endsWith('.js')) {
        continue;
      }

      let childChunks = this.chunkChildChunksMap.get(chunk);
      if (!childChunks) {
        childChunks = chunk.getAllAsyncChunks();
        this.chunkChildChunksMap.set(chunk, childChunks);
      }

      for (const childChunk of childChunks) {
        if (childChunk.id == null) {
          continue;
        }

        // TODO: find the use case when childChunk.files.size > 1
        const childChunkFile = [...childChunk.files][0];
        const placeholder = this.placeholderByChunkId.get(childChunk.id);

        if (isRealContentHash) {
          // triggers the RealContentHashPlugin.updateHash hook when it is enabled, in production mode
          compilation.updateAsset(
            childChunkFile,
            (source) => source,
            (assetInfo) => {
              return assetInfo
                ? {
                    ...assetInfo,
                    contenthash: Array.isArray(assetInfo.contenthash)
                      ? [...new Set([...assetInfo.contenthash, placeholder])]
                      : assetInfo.contenthash
                      ? [...new Set([assetInfo.contenthash, placeholder])]
                      : placeholder,
                  }
                : undefined;
            }
          );
        } else {
          // set integrity in development mode
          const oldSource = assets[chunkFile].source();
          const pos = oldSource.indexOf(placeholder);

          if (pos >= 0) {
            const integrity = Integrity.getIntegrity(this.compilation, assets[childChunkFile].buffer(), childChunkFile);
            const newAsset = new compiler.webpack.sources.ReplaceSource(assets[chunkFile], chunkFile);
            newAsset.replace(pos, pos + placeholder.length - 1, integrity, chunkFile);
            assets[chunkFile] = newAsset;
          }
        }
      }
    }
  }

  /**
   * Add the reference of integrity hashes into a tag object.
   *
   * @param {string} tagName
   * @param {string} source
   * @return {string}
   */
  addReference = (tagName, source) => {
    const { compilation, pluginName } = this;
    const { Template } = compilation.compiler.webpack;
    const { crossOriginLoading } = compilation.outputOptions;

    return Template.asString([
      source,
      `${tagName}.integrity = ${hashesReference}[chunkId];`,
      `${tagName}.crossOrigin = ${JSON.stringify(crossOriginLoading)};`,
    ]);
  };

  /**
   * Set the placeholder in the hash reference using the hash of a chunk file.
   * When the asset is processed, the placeholder will be replaced
   * with real integrity hash of the processed asset.
   *
   * @param {string} source
   * @param {Chunk} chunk
   * @return {string}
   */
  setReferencePlaceholder(source, chunk) {
    const { Template } = this.compilation.compiler.webpack;

    if (this.referencePlaceholders.has(chunk.id)) {
      return this.referencePlaceholders.get(chunk.id);
    }

    const childChunks = chunk.getAllAsyncChunks();
    this.chunkChildChunksMap.set(chunk, childChunks);

    const placeholders = {};
    for (const childChunk of childChunks) {
      const placeholder = getPlaceholder(childChunk.id);
      placeholders[childChunk.id] = placeholder;
      this.placeholderByChunkId.set(childChunk.id, placeholder);
      this.chunkByChunkId.set(childChunk.id, childChunk);
    }

    if (Object.keys(placeholders).length > 0) {
      const refTemplate = Template.asString([source, `${hashesReference} = ${JSON.stringify(placeholders)};`]);
      this.referencePlaceholders.set(chunk.id, refTemplate);

      return refTemplate;
    }

    return source;
  }

  /**
   * Get integrity string.
   * @see https://www.w3.org/TR/SRI/
   *
   * When the key is defined, the hash will be saved internal for stats.
   *
   * @param {Compilation} compilation
   * @param {string|*} data The string or a buffer content of the file.
   * @param {string|Chunk?} key The output filename of the data or the Chunk to lazy get the final filename.
   * @return {string}
   */
  static getIntegrity(compilation, data, key) {
    const integrity = this.computeIntegrity(data);

    if (key) {
      let value;

      // keep the same reference type to the value for collection and for dynamic imported assets
      if (typeof key === 'string') {
        value = new Set([key]).values();
      } else if (key.files != null) {
        // the real filename will be set later, therefore, wir can bind the reference as the iterator
        value = key.files.values();
      }

      if (value) {
        let hashes = this.hashes.get(compilation);
        if (!hashes) {
          hashes = new Map();
          this.hashes.set(compilation, hashes);
        }

        hashes.set(integrity, value);
      }
    }

    return integrity;
  }

  /**
   * @param {string} data The string or a buffer content of the file.
   * @return {string}
   */
  static computeIntegrity(data) {
    let integrity = '';

    if (typeof data !== 'string' && !Buffer.isBuffer(data)) {
      data = data.toString();
    }

    for (const funcName of this.hashFunctions) {
      const hash = crypto.createHash(funcName).update(data).digest('base64');
      if (integrity) integrity += ' ';
      integrity += `${funcName}-${hash}`;
    }

    return integrity;
  }

  /**
   * Get integrity hashes.
   *
   * @param {Compilation} compilation
   * @return {Map}
   */
  static getAssetHashes(compilation) {
    let assetHashes = this.assetHashes.get(compilation);
    if (assetHashes == null) {
      assetHashes = new Map();
      this.assetHashes.set(compilation, assetHashes);
      const hashes = this.hashes.get(compilation);

      if (hashes) {
        for (const [hash, value] of hashes) {
          const assetFile = value.next().value;
          assetHashes.set(assetFile, hash);
        }
      }
    }

    return assetHashes;
  }
}

/**
 * Create a temporary placeholder for the integrity value which will be computed later.
 * Note: the length of the placeholder should be the same as by real integrity hash.
 *
 * @param {string} chunkId
 * @return {string}
 */
const getPlaceholder = (chunkId) => {
  // the prefix must be exact 7 chars, the same length as a hash function name, e.g. 'sha256-'
  const placeholderPrefix = '___TMP-';
  const hash = Integrity.computeIntegrity(chunkId);

  return placeholderPrefix + hash.slice(placeholderPrefix.length);
};

module.exports = Integrity;
