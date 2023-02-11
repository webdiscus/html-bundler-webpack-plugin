const { pluginName } = require('../../config');
const { pathRelativeByPwd, outToConsole, isFunction } = require('../Utils');
const {
  green,
  greenBright,
  cyan,
  cyanBright,
  magenta,
  yellowBright,
  black,
  gray,
  ansi,
  yellow,
} = require('ansis/colors');
const Asset = require('../Asset');

const grayBright = ansi(245);
const header = black.bgGreen`[${pluginName}]`;

// max width of labels in first column
const padWidth = 12;

const pathRelativeByPwdArr = (files) => {
  for (let key in files) {
    files[key] = pathRelativeByPwd(files[key]);
  }

  return files;
};

/**
 * @param {string} name
 * @param {string} importFile
 * @param {string} outputPath
 * @param {string} filename
 * @param {string|function} filenameTemplate
 */
const verboseEntry = ({ name, importFile, outputPath, filename, filenameTemplate }) => {
  let str = `${header} Compile the entry ${green(name)}\n`;

  importFile = pathRelativeByPwd(importFile);
  outputPath = pathRelativeByPwd(outputPath);

  str += 'template: '.padStart(padWidth) + `${cyan(importFile)}\n`;
  str += 'output dir: '.padStart(padWidth) + `${cyanBright(outputPath)}\n`;
  str +=
    'filename: '.padStart(padWidth) +
    `${isFunction(filenameTemplate) ? greenBright`[Function: filename]` : magenta(filenameTemplate.toString())}\n`;

  str += 'asset: '.padStart(padWidth) + `${cyanBright(filename)}\n`;

  outToConsole(str);
};

/**
 * @param {Object} entity
 * @param {string} sourceFile
 * @param {string} outputPath
 * @param {string} title
 */
const verboseExtractModule = ({ entity, sourceFile, outputPath, title }) => {
  if (!title) title = 'Extract Module';

  let { issuers } = entity;
  let str = `${header}${black.bgWhite` ${title} `}\n`;

  sourceFile = pathRelativeByPwd(sourceFile);
  outputPath = pathRelativeByPwd(outputPath);

  str += 'source: '.padStart(padWidth) + `${cyan(sourceFile)}` + '\n';
  str += 'output dir: '.padStart(padWidth) + `${cyanBright(outputPath)}` + '\n';

  issuers.forEach((assetFile, htmlFile) => {
    str += `-> `.padStart(padWidth) + `${green(htmlFile)}` + '\n';
    str += `- `.padStart(padWidth + 2) + `${yellow(assetFile)}` + '\n';
  });

  outToConsole(str);
};

/**
 * @param {Object} entity
 * @param {string} outputPath
 */
const verboseExtractScript = ({ entity, outputPath }) => {
  const title = 'Extract JS';
  let { file, inline, issuers } = entity;
  let str = `${header}${black.bgWhite` ${title} `}\n`;

  file = pathRelativeByPwd(file);
  outputPath = pathRelativeByPwd(outputPath);

  if (inline) {
    str += `inline: `.padStart(padWidth) + `${greenBright`yes`}` + '\n';
  }

  str += 'source: '.padStart(padWidth) + `${cyan(file)}` + '\n';
  if (!inline) {
    str += 'output dir: '.padStart(padWidth) + `${cyanBright(outputPath)}` + '\n';
  }

  for (let { request, assets } of issuers) {
    request = pathRelativeByPwd(request);
    str += `template: `.padStart(padWidth) + `${magenta(request)}` + '\n';

    assets.forEach((assetFiles, htmlFile) => {
      str += `-> `.padStart(padWidth) + `${green(htmlFile)}` + '\n';
      assetFiles.forEach((jsFile) => {
        str += `- `.padStart(padWidth + 2) + `${yellow(jsFile)}` + '\n';
      });
    });
  }

  outToConsole(str);
};

/**
 * @param {Object} entity
 * @param {string} sourceFile
 * @param {string} outputPath
 */
const verboseExtractResource = ({ entity, sourceFile, outputPath }) => {
  const title = 'Extract Resource';
  let { issuers } = entity;
  let str = `${header}${black.bgWhite` ${title} `}\n`;

  sourceFile = pathRelativeByPwd(sourceFile);
  issuers = pathRelativeByPwdArr(issuers);
  outputPath = pathRelativeByPwd(outputPath);

  str += 'source: '.padStart(padWidth) + `${cyan(sourceFile)}\n`;
  str += 'output dir: '.padStart(padWidth) + `${cyanBright(outputPath)}` + '\n';

  for (let [issuer, asset] of issuers) {
    let issuerAsset = Asset.findAssetFile(issuer);
    let value = asset && asset.startsWith('data:') ? asset.slice(0, asset.indexOf(',')) + ',...' : asset;

    if (issuerAsset) {
      issuer = issuerAsset;
    }

    const issuerColor = issuer.endsWith('.html') ? green : yellow;

    str += '-> '.padStart(padWidth) + `${issuerColor(issuer)}\n`;
    str += '- '.padStart(padWidth + 2) + `${grayBright(value)}\n`;
  }

  outToConsole(str);
};

/**
 * @param {Object} entity
 * @param {string} sourceFile
 */
const verboseExtractInlineResource = ({ entity, sourceFile }) => {
  const title = 'Extract Inline Resource';
  let str = `${header}${black.bgWhite` ${title} `}\n`;

  sourceFile = pathRelativeByPwd(sourceFile);

  str += 'source: '.padStart(padWidth) + `${cyan(sourceFile)}\n`;

  if (entity.dataUrl) {
    const issuers = pathRelativeByPwdArr(Array.from(entity.dataUrl.issuers));

    str +=
      'data URL: '.padStart(padWidth) +
      grayBright(entity.cache.dataUrl.slice(0, entity.cache.dataUrl.indexOf(',')) + ',...') +
      '\n';

    str +=
      'in: '.padStart(padWidth) +
      '\n' +
      magenta('- '.padStart(padWidth) + issuers.join('\n' + '- '.padStart(padWidth))) +
      '\n';
  }

  if (entity.inlineSvg) {
    const issuers = pathRelativeByPwdArr(Array.from(entity.inlineSvg.issuers));
    const attrs = entity.cache.svgAttrs;
    let attrsString = '';

    for (let key in attrs) {
      attrsString += ' ' + key + '="' + attrs[key] + '"';
    }

    str += 'inline SVG: '.padStart(padWidth) + yellowBright('<svg' + attrsString + '>...</svg>') + '\n';
    str +=
      'in: '.padStart(padWidth) +
      '\n' +
      magenta('- '.padStart(padWidth) + issuers.join('\n' + '- '.padStart(padWidth))) +
      '\n';
  }

  outToConsole(str);
};

module.exports = {
  verboseEntry,
  verboseExtractModule,
  verboseExtractScript,
  verboseExtractResource,
  verboseExtractInlineResource,
};
