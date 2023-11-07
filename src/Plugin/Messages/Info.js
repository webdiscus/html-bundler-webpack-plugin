const path = require('path');
const {
  red,
  green,
  cyan,
  cyanBright,
  magenta,
  black,
  ansi256,
  bgAnsi256,
  yellowBright,
  bgAnsi,
  yellow,
} = require('ansis');
const Collection = require('../Collection');
const { outToConsole, isFunction } = require('../../Common/Helpers');
const { relativePathForView } = require('../../Common/FileUtils');
const { pluginName } = require('../../config');

const Dependency = require('../../Loader/Dependency');
const PluginService = require('../PluginService');

const gray = ansi256(244);
const padLevel1 = 16;
const padLevel2 = padLevel1 + 10;
const padLevel3 = padLevel2 + 8;
const padChunks = padLevel1 + 4;

/**
 * Get the compilation name styled based on the presence of an error.
 *
 * The compilation name is displayed in the console output when compilation is finished.
 *
 * @param {boolean} error
 * @return {string}
 */
const compilationName = (error) =>
  error
    ? bgAnsi(196).whiteBright` HTML Bundler Plugin ` + red` ▶▶▶`
    : bgAnsi(118).black` HTML Bundler Plugin ` + green` ▶▶▶`;

const colorType = (item, pad) => {
  let { type, inline } = item;
  const color = inline ? yellowBright : ansi256(112);

  if (type === Collection.type.style && item.imported) {
    type = inline ? `inline styles` : `import styles`;
  } else if (inline) {
    type = `inline`;
  }

  return color(`${type}:`.padStart(pad));
};

const renderAssets = (item, pad = padLevel2) => {
  const { type } = item;
  let str = '';
  // style can contain assets such as images, fonts
  const assets = item.assets;

  if (Array.isArray(assets)) {
    assets.forEach((assetItem) => {
      const { inline, resource, assetFile } = assetItem;
      const sourceFile = relativePathForView(resource);

      str += colorType(assetItem, pad) + ` ${cyan(sourceFile)}\n`;

      if (!inline && assetFile) {
        str += `${'->'.padStart(pad)} ${assetFile}\n`;
      }
    });
  }

  if (type === Collection.type.script) {
    const isSingleChunk = item.chunks.length === 1;
    let li;
    let padLen;

    if (isSingleChunk) {
      padLen = padLevel1;
    } else {
      padLen = padChunks;
      str += `${'->'.padStart(padLevel1)} ${ansi256(120)`chunks:`}` + '\n';
    }

    for (let { inline, chunkFile, assetFile } of item.chunks) {
      li = isSingleChunk ? '->' : '';
      if (inline) {
        str += `${li.padStart(padLen)} ${gray(path.basename(chunkFile))} ${yellow`(inline)`}\n`;
      } else {
        str += `${li.padStart(padLen)} ${assetFile}\n`;
      }
    }
  }

  return str;
};

/**
 * Display all processed assets in entry points.
 */
const verbose = () => {
  let str = '\n' + black.bgGreen` ${pluginName} ` + bgAnsi256(193).black` Entry processing ` + '\n';

  // display loader watch dependencies
  if (PluginService.isWatchMode()) {
    const watchFiles = Dependency.files;

    if (watchFiles && watchFiles.size > 0) {
      str += '\n';
      str += ansi256(134)`watch files:` + `\n`;

      // TODO: correct sort paths
      const files = Array.from(watchFiles).sort();
      for (let file of files) {
        file = relativePathForView(file);
        str += `${'-'.padStart(3)} ${ansi256(147)(file)}` + '\n';
      }
    }
  }

  // display assets
  for (let [entryAsset, { entry, assets, preloads }] of Collection.data) {
    const entrySource = relativePathForView(entry.resource);
    const outputPath = relativePathForView(entry.outputPath);

    str += '\n';
    str += bgAnsi256(27).whiteBright` ENTRY ` + ansi256(195).inverse` ${entryAsset} ` + '\n';
    // str += `${magenta`output:`} ${cyanBright(entry.outputPath)}\n`; // for debugging only
    str += `${magenta`source:`} ${cyanBright(entrySource)}\n`;
    str += `${magenta`output:`} ${cyanBright(outputPath)}\n`;

    // preload
    if (preloads?.length > 0) {
      str += ansi256(202)(`preloads:`) + `\n`;
      for (const item of preloads) {
        str += ansi256(209)(`${item.type}:`.padStart(padLevel1)) + ` ${yellowBright(item.tag)}\n`;
      }
    }

    // assets
    if (assets.length > 0) {
      str += green`assets:` + `\n`;
    }

    for (const item of assets) {
      let resource = item.resource;
      let resourceColor = cyan;

      if (item.imported) {
        resource = item.issuer.resource;
        resourceColor = gray;
      }

      let sourceFile = relativePathForView(resource);

      str += colorType(item, padLevel1) + ` ${resourceColor(sourceFile)}\n`;

      if (!item.inline && item.assetFile) {
        str += `${'->'.padStart(padLevel1)} ${item.assetFile}\n`;
      }

      // styles imported in JS
      if (item.imported) {
        str += `${''.padStart(padLevel1)} ${ansi256(214)`imports:`}\n`;
        // note: if a style is imported, then resource is an array
        for (let importItem of item.imports) {
          sourceFile = relativePathForView(importItem.resource);
          str += `${''.padStart(padChunks)} ${ansi256(143)(sourceFile)}\n`;
          str += renderAssets(importItem, padLevel3);
        }
      } else {
        str += renderAssets(item);
      }
    }
  }

  outToConsole(str);
};

module.exports = {
  compilationName,
  verbose,
};
