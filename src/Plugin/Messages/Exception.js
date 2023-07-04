const fs = require('fs');
const path = require('path');
const {
  reset,
  green,
  cyan,
  cyanBright,
  yellow,
  white,
  whiteBright,
  magenta,
  magentaBright,
  redBright,
} = require('ansis/colors');
const { pluginName } = require('../../config');

class PluginException extends Error {
  /**
   * @param {string} message The plugin error message.
   * @param {Error?} error The original error.
   */
  constructor(message, error) {
    message = `\n${reset.whiteBright.bgRedBright` ${pluginName} `} ${whiteBright(message)}\n`;

    if (error && error.stack) {
      message += error.stack;
    }

    super();
    this.name = this.constructor.name;
    this.message = message;
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
 * @throws {Error}
 */
const resolveException = (file, issuer, rootContext) => {
  let relFile = file;
  let isExistsFile = true;
  issuer = path.relative(rootContext, issuer);

  if (path.isAbsolute(file)) {
    relFile = path.relative(rootContext, file);
    isExistsFile = fs.existsSync(file);
  }

  let message = `Can't resolve ${yellow(relFile)} in the file ${cyan(issuer)}`;

  if (!isExistsFile) {
    message += `\n${redBright`The reason:`} this file is not found!`;
  } else if (/\.css$/.test(file) && file.indexOf('??ruleSet')) {
    message +=
      `\nThe handling of ${yellow`@import at-rules in CSS`} is not supported. Disable the 'import' option in 'css-loader':\n` +
      white`
{
  test: /\.(css|scss)$/i,
  use: [
    {
      loader: 'css-loader',
      options: {
        import: false, // disable @import at-rules handling
      },
    },
    'sass-loader',
  ],
},`;
  }

  throw new PluginException(message);
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
 * @param {ResourceInfo} info
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
const afterProcessException = (error, file) => {
  const message = `After process failed. Check you 'afterProcess' option.\nSource file: ${cyan(file)}.`;

  throw new PluginException(message, error);
};

module.exports = {
  PluginException,
  optionEntryPathException,
  optionPreloadAsException,
  resolveException,
  executeFunctionException,
  postprocessException,
  afterProcessException,
};
