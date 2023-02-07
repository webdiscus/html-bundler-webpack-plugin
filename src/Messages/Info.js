const { pluginName } = require('../config');
const { pathRelativeByPwd, outToConsole, isFunction } = require('../Utils');
const { green, greenBright, cyan, cyanBright, magenta, yellowBright, black, gray, ansi } = require('ansis/colors');
const Asset = require('../Asset');

const grayBright = ansi(245);
const header = black.bgGreen`[${pluginName}]`;

// width of labels in first column
const padWidth = 12;

const pathRelativeByPwdArr = (files) => {
  for (let key in files) {
    files[key] = pathRelativeByPwd(files[key]);
  }

  return files;
};

const verboseEntry = ({ name, importFile, outputPath, filename, filenameTemplate }) => {
  importFile = pathRelativeByPwd(importFile);
  outputPath = pathRelativeByPwd(outputPath);

  /**
   * @param {string} name
   * @param {string} importFile
   * @param {string} outputPath
   * @param {string} filename
   * @param {string|Function} filenameTemplate
   */
  outToConsole(
    `${header} Compile the entry ${green(name)}\n` +
      'filename: '.padStart(padWidth) +
      `${isFunction(filenameTemplate) ? greenBright`[Function: filename]` : magenta(filenameTemplate.toString())}\n` +
      'asset: '.padStart(padWidth) +
      `${cyanBright(filename)}\n` +
      'to: '.padStart(padWidth) +
      `${cyanBright(outputPath)}\n` +
      'source: '.padStart(padWidth) +
      `${cyan(importFile)}\n`
  );
};

/**
 * @param {Map} issuers
 * @param {string} sourceFile
 * @param {string} outputPath
 * @param {string} assetFile
 */
const verboseExtractResource = ({ issuers, sourceFile, outputPath, assetFile }) => {
  if (assetFile) {
    const header = 'Extract Resource';
    verboseExtractModule({ issuers, sourceFile, outputPath, assetFile, header });
    return;
  }

  verboseResolveResource({ issuers, sourceFile });
};

/**
 * @param {Map} issuers
 * @param {string} sourceFile
 * @param {string} outputPath
 * @param {string} assetFile
 * @param {string} title
 */
const verboseExtractModule = ({ issuers, sourceFile, outputPath, assetFile, title }) => {
  let issuerFiles = Array.isArray(issuers) ? issuers : Array.from(issuers.keys());

  sourceFile = pathRelativeByPwd(sourceFile);
  outputPath = pathRelativeByPwd(outputPath);
  issuerFiles = pathRelativeByPwdArr(issuerFiles);

  if (!title) title = 'Extract Module';

  const assetsStr = !Array.isArray(assetFile)
    ? 'asset: '.padStart(padWidth) + `${cyanBright(assetFile)}`
    : 'asset chunks: '.padStart(padWidth) +
      '\n' +
      magenta('- '.padStart(padWidth) + assetFile.join('\n' + '- '.padStart(padWidth)));

  const issuersStr =
    issuerFiles.length === 1
      ? magenta(issuerFiles[0])
      : '\n' + magenta('- '.padStart(padWidth) + issuerFiles.join('\n' + '- '.padStart(padWidth)));

  outToConsole(
    `${header}${black.bgWhite` ${title} `}\n` +
      assetsStr +
      '\n' +
      'to: '.padStart(padWidth) +
      `${cyanBright(outputPath)}\n` +
      'source: '.padStart(padWidth) +
      `${cyan(sourceFile)}\n` +
      'from: '.padStart(padWidth) +
      issuersStr +
      '\n'
  );
};

/**
 * @param {Map<string, string>} issuers
 * @param {string} sourceFile
 */
const verboseResolveResource = ({ issuers, sourceFile }) => {
  const title = 'Resolve Resource';
  let issuersStr = '';

  sourceFile = pathRelativeByPwd(sourceFile);
  issuers = pathRelativeByPwdArr(issuers);

  for (let [issuer, asset] of issuers) {
    let issuerAsset = Asset.findAssetFile(issuer);
    let value = asset && asset.startsWith('data:') ? asset.slice(0, asset.indexOf(',')) + ',...' : asset;

    if (issuerAsset) {
      issuer = issuerAsset;
    }

    issuersStr +=
      'in: '.padStart(padWidth) + `${magenta(issuer)}\n` + 'as: '.padStart(padWidth) + `${grayBright(value)}\n`;
  }

  outToConsole(
    `${header}${black.bgWhite` ${title} `}\n` + 'source: '.padStart(padWidth) + `${cyan(sourceFile)}\n` + issuersStr
  );
};

/**
 * @param {string} sourceFile
 * @param {Object} data
 */
const verboseExtractInlineResource = ({ sourceFile, data }) => {
  const title = 'Resolve Inline Resource';
  let inlineSvgStr = '';
  let inlineSvgIssuersStr = '';
  let dataUrlStr = '';
  let dataUrlIssuersStr = '';

  sourceFile = pathRelativeByPwd(sourceFile);

  if (data.dataUrl) {
    const issuers = pathRelativeByPwdArr(Array.from(data.dataUrl.issuers));

    dataUrlStr =
      'data URL: '.padStart(padWidth) +
      grayBright(data.cache.dataUrl.slice(0, data.cache.dataUrl.indexOf(',')) + ',...') +
      '\n';

    dataUrlIssuersStr =
      'in: '.padStart(padWidth) +
      '\n' +
      magenta('- '.padStart(padWidth) + issuers.join('\n' + '- '.padStart(padWidth))) +
      '\n';
  }

  if (data.inlineSvg) {
    const issuers = pathRelativeByPwdArr(Array.from(data.inlineSvg.issuers));
    const attrs = data.cache.svgAttrs;
    let attrsString = '';

    for (let key in attrs) {
      attrsString += ' ' + key + '="' + attrs[key] + '"';
    }

    inlineSvgStr = 'inline SVG: '.padStart(padWidth) + yellowBright('<svg' + attrsString + '>...</svg>') + '\n';
    inlineSvgIssuersStr =
      'in: '.padStart(padWidth) +
      '\n' +
      magenta('- '.padStart(padWidth) + issuers.join('\n' + '- '.padStart(padWidth))) +
      '\n';
  }

  outToConsole(
    `${header}${black.bgWhite` ${title} `}\n` +
      'source: '.padStart(padWidth) +
      `${cyan(sourceFile)}\n` +
      dataUrlStr +
      dataUrlIssuersStr +
      inlineSvgStr +
      inlineSvgIssuersStr
  );
};

module.exports = {
  verboseEntry,
  verboseExtractModule,
  verboseExtractResource,
  verboseExtractInlineResource,
};
