const path = require('path');
const Asset = require('./Asset');
const AssetEntry = require('./AssetEntry');
const AssetTrash = require('./AssetTrash');
const Options = require('./Options');
const ScriptCollection = require('./ScriptCollection');
const { isWin, pathToPosix } = require('./Utils');

class AssetScript {
  static index = {};

  /**
   * Clear cache.
   * Called only once, when the plugin is applied.
   */
  static clear() {
    this.index = {};
    ScriptCollection.clear();
  }

  /**
   * Reset settings.
   * Called before each compilation after changes by `webpack serv/watch`.
   */
  static reset() {
    this.index = {};
    ScriptCollection.reset();
  }

  /**
   * @param {{__isScript?:boolean|undefined, resource:string}} module The Webpack chunk module.
   *    Properties:<br>
   *      __isScript is cached state whether the Webpack module was resolved as JavaScript;<br>
   *      resource is source file of Webpack module.
   *
   * @return {boolean}
   */
  static isScript(module) {
    if (module.__isScript == null) {
      let [scriptFile] = module.resource.split('?', 1);
      if (isWin) scriptFile = pathToPosix(scriptFile);
      module.__isScript = ScriptCollection.has(scriptFile);
    }

    return module.__isScript;
  }

  /**
   * Find source file by its asset file.
   *
   * @param {string} assetFile The asset file.
   * @return {string|null} The source file.
   */
  static findSourceFile(assetFile) {
    const files = ScriptCollection.getAll().values();

    for (const { file, chunkFiles } of files) {
      if (chunkFiles.has(assetFile)) return file;
    }

    return null;
  }

  /**
   * @param {string} file The source file of script.
   * @return {string } Return unique assetFile
   */
  static getUniqueName(file) {
    const { name } = path.parse(file);
    let uniqueName = name;

    // the entrypoint name must be unique, if already exists then add an index: `main` => `main.1`, etc.
    if (!AssetEntry.isUnique(name, file)) {
      if (!this.index[name]) {
        this.index[name] = 1;
      }
      uniqueName = name + '.' + this.index[name]++;
    }

    return uniqueName;
  }

  /**
   * @param {string} issuer The source file of issuer of the required file.
   * @param {string} filename The asset filename of issuer.
   */
  static setIssuerFilename(issuer, filename) {
    if (!issuer) return;
    ScriptCollection.setIssuerFilename(issuer, filename);
  }

  /**
   * Resolve script file from request.
   *
   * @param {string} request The asset request.
   * @return {string|null} Return null if the request is not a script required in the template.
   */
  static resolveFile(request) {
    const [resource] = request.split('?', 1);
    return ScriptCollection.has(resource) ? resource : null;
  }

  /**
   * Replace all resolved source filenames with generating output filenames.
   * Note: this method must be called in the afterProcessAssets compilation hook.
   *
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  static substituteOutputFilenames(compilation) {
    const {
      assets,
      assetsInfo,
      chunks,
      namedChunkGroups,
      compiler: {
        webpack: {
          sources: { RawSource },
        },
      },
    } = compilation;
    const usedScripts = new Map();
    const splitFiles = new Set();
    const scripts = ScriptCollection.getAll().entries();
    const LF = Options.isDevMode() ? '\n' : '';

    // in the content, replace the source script file with the output filename
    for (let [sourceFile, asset] of scripts) {
      const { name } = asset;
      const chunkGroup = namedChunkGroups.get(name);

      if (!chunkGroup) {
        // prevent error when in HMR mode after removing a script in the template
        continue;
      }

      const chunkFiles = chunkGroup.getFiles().filter((file) => assetsInfo.get(file).hotModuleReplacement !== true);

      for (const issuer of asset.issuers) {
        for (const issuerAssetFilename of issuer.assets.keys()) {
          if (!assets.hasOwnProperty(issuerAssetFilename)) {
            // let's show an original error
            continue;
          }

          const issuerAssets = issuer.assets.get(issuerAssetFilename);

          // init script cache by current issuer
          if (!usedScripts.has(issuerAssetFilename)) {
            usedScripts.set(issuerAssetFilename, new Set());
          }

          const content = assets[issuerAssetFilename].source();
          let newContent = content;
          let scriptTags = '';

          // replace source filename with asset filename
          if (chunkFiles.length === 1) {
            const chunkFile = chunkFiles.values().next().value;
            const assetFile = Options.getAssetOutputFile(chunkFile, issuerAssetFilename);

            if (asset.inline === true) {
              const source = assets[chunkFile].source();
              const pos = content.indexOf(sourceFile);
              if (pos > -1) {
                // note: the str.replace(searchValue, replaceValue) is buggy when the replaceValue contains chars chain '$$'
                newContent = content.slice(0, pos) + source + content.slice(pos + sourceFile.length);
                // note: the keys in compilation.assets are exact the chunkFile
                AssetTrash.add(chunkFile);
              }
            } else {
              newContent = content.replace(sourceFile, assetFile);
              // set relation between source file and generated output filenames
              asset.chunkFiles.add(chunkFile);
              // set relation between output issuer file and generated asset chunks used in issuer
              issuerAssets.push(assetFile);
              splitFiles.add(chunkFile);
            }
          } else {
            // extract original script tag with all attributes for usage it as template for chunks
            let srcStartPos = content.indexOf(sourceFile);
            let srcEndPos = srcStartPos + sourceFile.length;
            let tagStartPos = srcStartPos;
            let tagEndPos = srcEndPos;

            while (tagStartPos >= 0 && content.charAt(--tagStartPos) !== '<') {}
            tagEndPos = content.indexOf('</script>', tagEndPos) + 9;

            const tmplScriptStart = content.slice(tagStartPos, srcStartPos);
            const tmplScriptEnd = content.slice(srcEndPos, tagEndPos);

            // generate additional scripts of chunks
            const chunkScripts = usedScripts.get(issuerAssetFilename);
            for (let chunkFile of chunkFiles) {
              // avoid generate a script of the same split chunk used in different js files required in one template file,
              // happens when used optimisation.splitChunks
              if (!chunkScripts.has(chunkFile)) {
                const assetFile = Options.getAssetOutputFile(chunkFile, issuerAssetFilename);

                if (scriptTags) scriptTags += LF;
                scriptTags += tmplScriptStart + assetFile + tmplScriptEnd;
                chunkScripts.add(chunkFile);
                splitFiles.add(chunkFile);
                // set relation between output issuer file and generated asset chunks used in issuer
                issuerAssets.push(assetFile);
              }
            }

            // inject <script> tags generated by chunks and replace source file with output filename
            if (scriptTags) {
              // add LF after injected scripts when next char is not a new line
              if (content[tagEndPos] !== '\n' && content[tagEndPos] !== '\r') scriptTags += LF;
              newContent = content.slice(0, tagStartPos) + scriptTags + content.slice(tagEndPos);
            }

            // set relation between source file and generated output filenames
            chunkFiles.forEach(asset.chunkFiles.add, asset.chunkFiles);
          }

          // update compilation asset content
          assets[issuerAssetFilename] = new RawSource(newContent);
        }
      }
    }

    // remove generated unused split files
    for (let { chunkReason, files } of chunks) {
      if (chunkReason && chunkReason.startsWith('split chunk')) {
        for (let file of files) {
          if (!splitFiles.has(file)) {
            AssetTrash.add(file);
          }
        }
      }
    }
  }
}

module.exports = AssetScript;
