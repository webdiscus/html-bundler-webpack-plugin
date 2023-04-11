const fs = require('fs');
const path = require('path');
const { reset, green, cyan, cyanBright, yellow, white, whiteBright, blueBright } = require('ansis/colors');
const { pluginName } = require('../../config');

class PluginException extends Error {
  /**
   * @param {string} message The plugin error message.
   * @param {Error?} error The original error.
   */
  constructor(message, error) {
    message = `\n${reset.whiteBright.bgRedBright` ${pluginName} `} ${whiteBright(message)}\n`;

    super(message);
    this.name = this.constructor.name;

    if (error && error.stack) {
      this.stack = error.stack;
    }
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
 * @param {ModuleOptions[]} modules
 * @throws {Error}
 */
const optionModulesException = (modules) => {
  const message =
    `The plugin option ${green`modules`} must be the array of ${green`ModuleOptions`} but given:\n` +
    cyanBright(JSON.stringify(modules, null, '  '));

  throw new PluginException(message);
};

/**
 * @param {Object} config
 * @throws {Error}
 */
const optionPreloadAsException = (config) => {
  const replacer = (key, value) => {
    if (value instanceof RegExp) {
      return value.toString();
    }
    return value;
  };

  const configString = JSON.stringify(config, replacer, '  ');

  const message =
    `Missing the ${green`'as'`} property in a configuration object of the plugin option ${green`preload`}:\n` +
    configString +
    '\n';

  throw new PluginException(message);
};

/**
 * @param {string} file
 * @param {string} issuer
 * @throws {Error}
 */
const resolveException = (file, issuer) => {
  let message = `Can't resolve the file ${cyan(file)} in ${blueBright(issuer)}`;

  if (path.isAbsolute(file) && !fs.existsSync(file)) {
    message += `\n${yellow`The reason:`} this file not found!`;
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
const executeTemplateFunctionException = (error, sourceFile) => {
  const message = `Failed to execute the template function.\nSource file: '${cyan(sourceFile)}'`;

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

module.exports = {
  PluginException,
  optionEntryPathException,
  optionModulesException,
  optionPreloadAsException,
  resolveException,
  executeTemplateFunctionException,
  postprocessException,
};
