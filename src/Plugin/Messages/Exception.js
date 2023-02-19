const fs = require('fs');
const path = require('path');
const { red, green, cyan, cyanBright, yellow, white, blueBright } = require('ansis/colors');
const { pluginName } = require('../../config');

const header = `\n${red`[${pluginName}]`}`;
let lastError = null;

class PluginException extends Error {
  constructor(message) {
    super(message);
    this.name = 'PluginException';
    this.message = message;
  }
}

/**
 * @param {string} message The error description.
 * @param {PluginException|Error|string?} error The original error from catch()
 * @constructor
 */
const PluginError = function (message, error = '') {
  if (error && error instanceof PluginException) {
    if (error.toString() === lastError) {
      // prevent double output same error
      throw new PluginException(lastError);
    }
    // throw original error to avoid output all nested exceptions
    lastError = error.toString();
    throw new Error(lastError);
  }
  lastError = message + `\n` + error;
  throw new PluginException(lastError);
};

/**
 * @param {ModuleOptions[]} modules
 * @throws {Error}
 */
const optionModulesException = (modules) => {
  const message =
    `${header} The plugin option ${green`modules`} must be the array of ${green`ModuleOptions`} but given:\n` +
    cyanBright(JSON.stringify(modules));

  PluginError(message);
};

/**
 * @param {string} file
 * @param {string} issuer
 * @throws {Error}
 */
const resolveException = (file, issuer) => {
  let message = `${header} Can't resolve the file ${cyan(file)} in ${blueBright(issuer)}`;

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

  PluginError(message);
};

/**
 * @param {Error} error
 * @param {string} sourceFile
 * @throws {Error}
 */
const executeTemplateFunctionException = (error, sourceFile) => {
  const message = `${header} Failed to execute the template function'.\nSource file: '${cyan(sourceFile)}'`;

  PluginError(message, error);
};

/**
 * @param {Error} error
 * @param {ResourceInfo} info
 * @throws {Error}
 */
const postprocessException = (error, info) => {
  const message = `${header} Postprocess is failed'.\nSource file: '${cyan(info.sourceFile)}'.`;

  PluginError(message, error);
};

module.exports = {
  PluginError,
  PluginException,
  optionModulesException,
  resolveException,
  executeTemplateFunctionException,
  postprocessException,
};
