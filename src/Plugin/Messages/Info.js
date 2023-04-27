const path = require('path');
const { green, cyan, cyanBright, magenta, black, ansi256, bgAnsi256, yellowBright, ansi } = require('ansis/colors');
const Collection = require('../Collection');
const { outToConsole, isFunction } = require('../../Common/Helpers');
const { relativePathForView } = require('../../Common/FileUtils');
const { pluginName } = require('../../config');

const Dependency = require('../../Loader/Dependency');
const PluginService = require('../PluginService');

const gray = ansi256(244);

const padLevel1 = 15;
const padLevel2 = padLevel1 + 10;
const padChunks = padLevel1 + 4;

const colorType = (item, pad) => {
  let { type, inline } = item;
  const color = inline ? yellowBright : ansi256(112);

  if (type === Collection.type.style && item.imports != null) {
    type = inline ? `inline styles` : `import styles`;
  } else if (inline) {
    type = `inline`;
  }

  return color(`${type}:`.padStart(pad));
};

const renderAssets = (item) => {
  let str = '';
  // style can contain resource such as images, fonts
  const assets = item?.ref?.assets ? item.ref.assets : item.assets;
  if (Array.isArray(assets)) {
    assets.forEach((assetResource) => {
      let sourceFile = relativePathForView(assetResource.resource);

      str += colorType(assetResource, padLevel2) + ` ${cyan(sourceFile)}\n`;

      if (assetResource.inline) {
        return;
      }

      if (assetResource.assetFile) {
        str += `${'->'.padStart(padLevel2)} ${assetResource.assetFile}\n`;
      }
    });
  }

  // js
  if (Array.isArray(item.chunks)) {
    if (item.chunks.length === 1) {
      if (!item.inline) {
        str += `${'->'.padStart(padLevel1)} ${item.chunks[0].assetFile}\n`;
      }
    } else {
      if (item.inline) {
        str += `${''.padStart(padLevel1)} ${ansi256(226)`inline chunks:`}` + '\n';
      } else {
        str += `${'->'.padStart(padLevel1)} ${ansi256(120)`chunks:`}` + '\n';
      }
      for (let { chunkFile, assetFile } of item.chunks) {
        if (item.inline) {
          str += `${'-'.padStart(padChunks)} ${gray(path.basename(chunkFile))}\n`;
        } else {
          str += `${'-'.padStart(padChunks)} ${assetFile}\n`;
        }
      }
    }
  }

  return str;
};

/**
 * Display all processed resources in entry points.
 */
const verbose = () => {
  let str = '\n' + black.bgGreen` ${pluginName} ` + bgAnsi256(193).black` Entry processing ` + '\n';

  // display loader watch dependencies
  if (PluginService.isWatchMode()) {
    const watchFiles = Dependency.files;

    if (watchFiles && watchFiles.size > 0) {
      str += '\n';
      str += ansi256(134)`watch files:` + `\n`;

      for (let file of watchFiles) {
        file = relativePathForView(file);
        str += `${'-'.padStart(3)} ${ansi256(147)(file)}` + '\n';
      }
    }
  }

  // display resources
  for (let [entryAsset, { entry, resources, preloads }] of Collection.data) {
    const entrySource = relativePathForView(entry.resource);
    const outputPath = relativePathForView(entry.outputPath);

    str += '\n';
    str += bgAnsi256(27).whiteBright` ENTRY ` + ansi256(195).inverse` ${entryAsset} ` + '\n';
    //str += `${magenta`output:`} ${cyanBright(entry.outputPath)}\n`; // for debugging only
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
    if (resources.length > 0) {
      str += green(`assets:`) + `\n`;
    }

    for (const item of resources) {
      if (item.imported) {
        // skip single imported style because it will be viewed as the group of all styles imported in one JS file
        continue;
      }

      const hasImports = item.imports?.length > 0;
      let resource = item.resource;
      let resourceColor = cyan;

      if (hasImports) {
        resource = item.issuer.resource;
        resourceColor = gray;
      }

      let sourceFile = relativePathForView(resource);

      str += colorType(item, padLevel1) + ` ${resourceColor(sourceFile)}\n`;

      if (!item.inline && item.assetFile) {
        str += `${'->'.padStart(padLevel1)} ${item.assetFile}\n`;
      }

      if (hasImports) {
        for (const importedItem of item.imports) {
          let sourceFile = relativePathForView(importedItem.resource);

          str += `${''.padStart(padLevel1)}` + ` ${cyanBright(sourceFile)}\n`;
          str += renderAssets(importedItem);
        }
      } else {
        str += renderAssets(item);
      }
    }
  }

  outToConsole(str);
};

module.exports = {
  verbose,
};
