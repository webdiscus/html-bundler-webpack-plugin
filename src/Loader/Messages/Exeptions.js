const ansis = require('ansis');
const { red, redBright, yellow, cyan, green } = require('ansis/colors');
const { loaderName } = require('../config');

const loaderHeader = `\n${red`[${loaderName}]`}`;
const filterHeader = `\n${red`[${loaderName}:filter]`}`;
const loaderHeaderHtml = `<span style="color:#e36049">[${loaderName}]</span>`;
let lastError = null;

class LoaderException extends Error {
  constructor(message) {
    super(message);
    this.name = 'LoaderException';
    this.message = message;
  }
}

/**
 * @param {string} message The error description.
 * @param {LoaderException|Error|string?} error The original error from catch()
 * @constructor
 */
const LoaderError = function (message, error = '') {
  if (error && error instanceof LoaderException) {
    if (error.toString() === lastError) {
      // prevent double output same error
      throw new LoaderException(lastError);
    }
    // throw original error to avoid output all nested exceptions
    lastError = error.toString();
    throw new Error(lastError);
  }
  lastError = message + `\n\n${redBright`Original Error:`}\n` + error;
  throw new LoaderException(lastError);
};

/**
 * @param {LoaderException|Error} error The original error.
 * @param {string} file The resource file.
 * @param {string} templateFile The template file.
 * @throws {Error}
 */
const resolveException = (error, file, templateFile) => {
  const message = `${loaderHeader} The file ${yellow(file)} can't be resolved in the template:\n` + cyan(templateFile);

  LoaderError(message, error);
};

/**
 * @param {Error} error
 * @returns {string}
 */
const getCompileErrorMessage = (error) => {
  return `${loaderHeader} Template compilation failed.\n` + error.toString();
};

/**
 * @param {string} error
 * @param {string} requireHmrScript
 * @returns {string}
 */
const errorTemplateHtml = (error, requireHmrScript) => {
  let message = error.replace(/\n/g, '<br>');
  message = ansis.strip(message);
  message = message.replace(`[${loaderName}]`, loaderHeaderHtml);

  return `<!DOCTYPE html><html>
<head><script src="${requireHmrScript}"></script></head>
<body><div>${message}</div></body></html>`.replace(/\n/g, '');
};

/**
 * @param {Error} error
 * @param {string} requireHmrScript
 * @returns {string}
 */
const getCompileErrorHtml = (error, requireHmrScript) => {
  return errorTemplateHtml(getCompileErrorMessage(error), requireHmrScript);
};

/**
 * @param {Error} error
 * @param {string} requireHmrScript
 * @returns {string}
 */
const getExecuteTemplateFunctionErrorMessage = (error, requireHmrScript) => {
  return errorTemplateHtml(error.toString(), requireHmrScript);
};

module.exports = {
  LoaderError,
  resolveException,
  getExecuteTemplateFunctionErrorMessage,
  getCompileErrorMessage,
  getCompileErrorHtml,
};
