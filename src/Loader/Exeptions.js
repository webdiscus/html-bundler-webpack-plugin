const ansis = require('ansis');
const { red, redBright, yellow, cyan, green } = require('ansis/colors');
const { loaderName } = require('./config');

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
 * @param {string} value The value to interpolate.
 * @param {string} templateFile The template file.
 * @throws {Error}
 */
const unsupportedInterpolationException = (value, templateFile) => {
  const message =
    `${loaderHeader} the expression ${yellow(value)} can't be interpolated with the 'compile' method.\n` +
    `Template: ${cyan(templateFile)}\n` +
    `${yellow`Possible solution: `} Try to use the loader option 'method' as 'render' or change your dynamic filename to static or use webpack alias.`;

  LoaderError(message);
};

/**
 * @param {LoaderException|Error} error The original error.
 * @param {string} sourceFile
 * @throws {Error}
 */
const executeTemplateFunctionException = (error, sourceFile) => {
  const message = `${loaderHeader} Failed to execute template function.\nTemplate file: ${cyan(sourceFile)}`;

  LoaderError(message, error);
};

const loadNodeModuleException = (moduleName) => {
  throw new Error(
    `\n${filterHeader} The required ${red(moduleName)} module not found.\n` +
      `Please install the module: ${cyan`npm i --save-dev ${moduleName}`}`
  );
};

/**
 * @param {string} filterName
 * @param {string} availableFilters
 * @throws {Error}
 */
const filterNotFoundException = (filterName, availableFilters) => {
  const message =
    `${loaderHeader} The 'embedFilters' option contains unknown filter: ${red(filterName)}.\n` +
    `Available embedded filters: ${green(availableFilters)}.`;

  LoaderError(message);
};

/**
 * @param {string} filterName
 * @param {string} filterPath
 * @param {Error} error
 */
const filterLoadException = (filterName, filterPath, error) => {
  const message =
    `${loaderHeader} Error by load the ${red(filterName)} filter.\nFilter file: ${cyan(filterPath)}\n` + error;

  LoaderError(message);
};

/**
 * @param {string} filterName
 * @param {Error} error
 */
const filterInitException = (filterName, error) => {
  const message = `${loaderHeader} Error by initialisation the ${red(filterName)} filter.\n` + error;

  LoaderError(message);
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
  unsupportedInterpolationException,
  executeTemplateFunctionException,
  loadNodeModuleException,
  getExecuteTemplateFunctionErrorMessage,
  getCompileErrorMessage,
  getCompileErrorHtml,
  filterNotFoundException,
  filterLoadException,
  filterInitException,
};
