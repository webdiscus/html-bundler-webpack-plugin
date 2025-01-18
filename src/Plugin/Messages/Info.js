const path = require('path');
const { red, green, cyan, cyanBright, magenta, black, yellow, yellowBright, fg, bg, white } = require('ansis');
const { outToConsole, isFunction } = require('../../Common/Helpers');
const { relativePathVerbose } = require('../../Common/FileUtils');
const Config = require('../../Common/Config');

const PluginService = require('../PluginService');
const Collection = require('../Collection');

const { pluginLabel } = Config.get();

const gray = fg(244);
const padLevel1 = 16;
const padLevel2 = padLevel1 + 10;
const padLevel3 = padLevel2 + 8;
const padChunks = padLevel1 + 4;

/**
 * Get the compilation name styled based on the presence of an error.
 *
 * The compilation name is displayed in the console output when compilation is finished.
 *
 * @param {string|undefined} name
 * @param {boolean} error
 * @return {string}
 */
const compilationName = (name, error) => {
  let configName = '';

  if (name != null) {
    configName = white` config ${magenta`[${name}]`}`;
  }

  return error
    ? bg(196).whiteBright` ${pluginLabel} ` + red` ${configName} ▶▶▶`
    : bg(118).black` ${pluginLabel} ` + green` ${configName} ▶▶▶`;
};

const colorType = (item, pad) => {
  let { type, inline } = item;
  const color = inline ? yellowBright : fg(112);

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
      const sourceFile = relativePathVerbose(resource);

      str += colorType(assetItem, pad) + ` ${cyan(sourceFile)}\n`;

      if (!inline && assetFile) {
        str += `${'->'.padStart(pad)} ${assetFile}\n`;
      }
    });
  }

  if (type === Collection.type.script) {
    const chunks = item.chunks || [];
    const children = item.children || [];
    const files = [...chunks, ...children];
    const isSingleChunk = files.length === 1;
    let li;
    let padLen;

    if (isSingleChunk) {
      padLen = padLevel1;
    } else {
      padLen = padChunks;
      str += `${'->'.padStart(padLevel1)} ${fg(120)`chunks:`}` + '\n';
    }

    for (let { inline, chunkFile, assetFile } of files) {
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
 * @param {Compiler} pluginCompiler
 */
const verbose = (pluginCompiler) => {
  const pluginContext = PluginService.getPluginContext(pluginCompiler);

  const collection = pluginContext.collection;
  const collectionData = collection.getData();
  const dependency = PluginService.getLoaderDependency(pluginCompiler);
  let str = '\n' + black.bgGreen` ${pluginLabel} ` + bg(193).black` Entry processing ` + '\n';

  // display loader watch dependencies
  // TODO: fix verbose of dependency after start/stop in serve/watch mode when used cache filesystem
  if (dependency && PluginService.isWatchMode(pluginCompiler)) {
    const watchFiles = dependency.getFiles();

    if (watchFiles && watchFiles.size > 0) {
      str += '\n';
      str += fg(134)`watch files:` + `\n`;

      // TODO: correct sort paths
      const files = Array.from(watchFiles).sort();
      for (let file of files) {
        file = relativePathVerbose(file);
        str += `${'-'.padStart(3)} ${fg(147)(file)}` + '\n';
      }
    }
  }

  // display assets
  for (let [entryAsset, { entry, assets, preloads }] of collectionData) {
    const entrySource = relativePathVerbose(entry.resource);
    const outputPath = relativePathVerbose(entry.outputPath);

    str += '\n';
    str += bg(27).whiteBright` ENTRY ` + bg(195).black` ${entryAsset} ` + '\n';
    // str += `${magenta`output:`} ${cyanBright(entry.outputPath)}\n`; // for debugging only
    str += `${magenta`source:`} ${cyanBright(entrySource)}\n`;
    str += `${magenta`output:`} ${cyanBright(outputPath)}\n`;

    // preload
    if (preloads?.length > 0) {
      str += fg(202)(`preloads:`) + `\n`;
      for (const item of preloads) {
        str += fg(209)(`${item.type}:`.padStart(padLevel1)) + ` ${yellowBright(item.tag)}\n`;
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

      let sourceFile = relativePathVerbose(resource);

      str += colorType(item, padLevel1) + ` ${resourceColor(sourceFile)}\n`;

      if (!item.inline && item.assetFile) {
        str += `${'->'.padStart(padLevel1)} ${item.assetFile}\n`;
      }

      // styles imported in JS
      if (item.imported) {
        str += `${''.padStart(padLevel1)} ${fg(214)`imports:`}\n`;
        // note: if a style is imported, then resource is an array
        for (let importItem of item.imports) {
          sourceFile = relativePathVerbose(importItem.resource);
          str += `${''.padStart(padChunks)} ${fg(143)(sourceFile)}\n`;
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
