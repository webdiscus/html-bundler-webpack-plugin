const fs = require('fs');
const path = require('path');
const { reset, green, cyan, cyanBright, yellow, white, whiteBright, redBright } = require('ansis');
const Config = require('../../Common/Config');

const { pluginLabel } = Config.get();
const PluginError = new Set();

class PluginException extends Error {
  /**
   * @param {string} message The plugin error message.
   * @param {Error?} error The original error.
   */
  constructor(message, error) {
    message = `\n${reset.whiteBright.bgRedBright` ${pluginLabel} `} ${whiteBright(message)}\n`;

    if (error && error.stack) {
      message += error.stack;
    }

    super();
    this.name = this.constructor.name;
    this.message = message;

    PluginError.add(this);
  }
}

/**
 * @param {string} dir
 * @throws {Error}
 */
const optionEntryPathException = (dir) => {
  const message =
    `The plugin option ${green`entry`} must be a relative or an absolute path to the entry directory.\nThe directory is invalid or not found:\n` +
    cyanBright(dir);

  throw new PluginException(message);
};

/**
 * @param {Object} config
 * @param {string|null} type
 * @param {Array<string>} availableTypes
 * @throws {Error}
 */
const optionPreloadAsException = (config, type, availableTypes) => {
  const replacer = (key, value) => {
    if (value instanceof RegExp) {
      return value.toString();
    }
    return value;
  };

  const configString = JSON.stringify(config, replacer, '  ');
  let message = '';

  if (type && availableTypes.indexOf(type) < 0) {
    message =
      `Invalid value of the ${green`'as'`} property in the plugin option ${green`preload`}:\n` +
      configString +
      '\n' +
      `The value must be one of the following: ` +
      JSON.stringify(availableTypes) +
      '\n';
  } else {
    message = `Missing the ${green`'as'`} property in the plugin option ${green`preload`}:\n` + configString + '\n';
  }

  throw new PluginException(message);
};

/**
 * @param {string} file The unresolved file can be absolute or relative.
 * @param {string} issuer The absolute issuer file of unresolved file.
 * @param {string} rootContext The absolute path to project files.
 * @param {object} pluginOptions The instance of the pluginOptions.
 * @throws {Error}
 */
const resolveException = (file, issuer, rootContext, pluginOptions) => {
  let isExistsFile = true;
  issuer = path.relative(rootContext, issuer);

  if (path.isAbsolute(file)) {
    isExistsFile = fs.existsSync(file);
  }

  let message = `Can't resolve ${yellow(file)} in the file ${cyan(issuer)}`;

  if (!isExistsFile) {
    message = `File ${yellow(file)} not found in ${cyan(issuer)}`;
  } else if (/\.css$/.test(file) && file.includes('??ruleSet')) {
    message +=
      `\nThe handling of ${yellow`@import at-rules in CSS`} is not supported. Disable the 'import' option in 'css-loader':\n` +
      white`
{
  test: /\.css$/i,
  use: [
    {
      loader: 'css-loader',
      options: {
        import: false, ${white`// disable @import at-rules handling`}
      },
    },
  ],
},`;
  } else if (pluginOptions.isStyle(file) && hasSplitChunksCacheGroups(pluginOptions.webpackOptions)) {
    message += `\n
${whiteBright.bgGreen` Tip `} 
Add the ${white`'splitChunks.cacheGroups.{cacheGroup}.test'`} option as a RegExp to each cache group to split only script files, excluding styles.
For example:

optimization: {
  splitChunks: {
    minSize: 1000,
    cacheGroups: {
      default: {
        test: /.+\.(js|ts)$/, ${white`// split only scripts, excluding style files`}
        name: 'common',
        chunks: 'all',
      },
      vendors: {
        test: /[\\/]node_modules[\\/].+\.(js|ts)$/, ${white`// split only scripts, excluding style files`}
        name: 'vendor',
        chunks: 'all',
      },
    },
  },
},
`;
  }

  throw new PluginException(message);
};

/**
 * Detect whether Webpack config contains `splitChunks.cacheGroups` option.
 *
 * @param webpackOptions
 * @return {boolean}
 */
const hasSplitChunksCacheGroups = (webpackOptions) => {
  return webpackOptions?.optimization?.splitChunks?.cacheGroups != null;
};

/**
 * @param {Error} error
 * @param {string} sourceFile
 * @throws {Error}
 */
const executeFunctionException = (error, sourceFile) => {
  const message = `Failed to execute the function.\nSource file: '${cyan(sourceFile)}'`;

  throw new PluginException(message, error);
};

/**
 * @param {Error} error
 * @param {TemplateInfo} info
 * @throws {Error}
 */
const postprocessException = (error, info) => {
  const message = `Postprocess failed.\nSource file: ${cyan(info.sourceFile)}.`;

  throw new PluginException(message, error);
};

/**
 * @param {Error} error
 * @param {string} file
 * @throws {Error}
 */
const beforeEmitException = (error, file) => {
  const message = `Before emit failed. Check you 'beforeEmit' option.\nSource file: ${cyan(file)}.`;

  throw new PluginException(message, error);
};

/**
 * @param {Error} error
 * @return {PluginException} Return the error for promise.
 */
const afterEmitException = (error) => {
  const message = `After emit failed. Check you 'afterEmit' option.`;

  return new PluginException(message, error);
};

/**
 * @throws {Error}
 */
const missingCrossOriginForIntegrityException = () => {
  const message = `When using the ${yellow`'integrity'`} plugin option, must be specified the Webpack option ${yellow`'output.crossOriginLoading'`}.`;

  throw new PluginException(message);
};

/**
 * @param {string} sourceFile
 * @throws {Error}
 */
const noHeadException = (sourceFile) => {
  const message =
    `The imported style can't be injected in HTML. The template not contains ${yellow`<head>`} tag.\n` +
    `The template: ${cyan(sourceFile)}`;

  throw new PluginException(message, null);
};

module.exports = {
  PluginError,
  PluginException,
  optionEntryPathException,
  optionPreloadAsException,
  resolveException,
  executeFunctionException,
  postprocessException,
  beforeEmitException,
  afterEmitException,
  missingCrossOriginForIntegrityException,
  noHeadException,
};
