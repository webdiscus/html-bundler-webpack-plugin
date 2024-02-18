const ansis = require('ansis');
const { red, redBright, yellow, cyan, green, whiteBright, gray } = require('ansis');
const { loaderName, labelError } = require('./Utils');

const loaderLabel = labelError();
const filterLabel = labelError('filter');
const loaderHtmlLabel = `<span style="color:#e36049">[${loaderName}]</span>`;
let lastError = null;

class PugLoaderException extends Error {
  constructor(message) {
    super(message);
    this.name = 'PugLoaderException';
    this.message = message;
  }
}

/**
 * @param {string} message The error description.
 * @param {PugLoaderException|Error|string?} error The original error from catch()
 * @constructor
 */
const PugLoaderError = function (message, error = '') {
  if (error && error instanceof PugLoaderException) {
    if (error.toString() === lastError) {
      // prevent double output same error
      throw new PugLoaderException(lastError);
    }
    // throw original error to avoid output all nested exceptions
    lastError = error.toString();
    throw new Error(lastError);
  }
  lastError = whiteBright(message) + `\n\n${redBright`Original Error:`}\n` + error;
  throw new PugLoaderException(lastError);
};

/**
 * @param {PugLoaderException|Error} error The original error.
 * @param {string} file The resource file.
 * @param {string} templateFile The template file.
 * @throws {Error}
 */
const resolveException = (error, file, templateFile) => {
  const message =
    `${loaderLabel} The file ${yellow(file)} can't be resolved in the pug template:\n` + cyan(templateFile);

  PugLoaderError(message, error);
};

/**
 * @param {string} value The value to interpolate.
 * @param {string} templateFile The template file.
 * @throws {Error}
 */
const unsupportedInterpolationException = (value, templateFile) => {
  const message =
    `${loaderLabel} the expression ${yellow(value)} can't be interpolated with the 'compile' method.\n` +
    `Template: ${cyan(templateFile)}\n` +
    `${yellow`Possible solution: `} Try to use the loader option 'method' as 'render' or change your dynamic filename to static or use webpack alias.`;

  PugLoaderError(message);
};

/**
 * @param {PugLoaderException|Error} error The original error.
 * @param {string} sourceFile
 * @throws {Error}
 */
const executeTemplateFunctionException = (error, sourceFile) => {
  const message = `${loaderLabel} Failed to execute template function.\nTemplate file: ${cyan(sourceFile)}`;

  PugLoaderError(message, error);
};

const loadNodeModuleException = (moduleName) => {
  throw new Error(
    whiteBright`${filterLabel} The required ${red(
      moduleName
    )} module not found. Please install the module: ${cyan`npm i -D ${moduleName}`}`
  );
};

/**
 * @param {string} filterName
 * @param {string} availableFilters
 * @throws {Error}
 */
const filterNotFoundException = (filterName, availableFilters) => {
  const message =
    `${loaderLabel} The 'embedFilters' option contains unknown filter: ${red(filterName)}.\n` +
    `Available embedded filters: ${green(availableFilters)}.`;

  PugLoaderError(message);
};

/**
 * @param {string} filterName
 * @param {string} filterPath
 * @param {Error} error
 */
const filterLoadException = (filterName, filterPath, error) => {
  const message =
    `${loaderLabel} Error by load the ${red(filterName)} filter.\nFilter file: ${cyan(filterPath)}\n` + error;

  PugLoaderError(message);
};

/**
 * @param {string} filterName
 * @param {Error} error
 */
const filterInitException = (filterName, error) => {
  const message = `${loaderLabel} Error by initialisation the ${red(filterName)} filter.\n` + error;

  PugLoaderError(message);
};

/**
 * @param {Error} error
 * @returns {string}
 */
const getPugCompileErrorMessage = (error) => {
  return `${loaderLabel} Pug compilation failed.\n` + error.toString();
};

/**
 * @param {string} error
 * @param {string} requireHmrScript
 * @returns {string}
 */
const errorTemplateHtml = (error, requireHmrScript) => {
  let message = error.replace(/\n/g, '<br>');
  message = ansis.strip(message);
  message = message.replace(`[${loaderName}]`, loaderHtmlLabel);

  return `<!DOCTYPE html><html>
<head><script src="${requireHmrScript}"></script></head>
<body><div>${message}</div></body></html>`.replace(/\n/g, '');
};

/**
 * @param {Error} error
 * @param {string} requireHmrScript
 * @returns {string}
 */
const getPugCompileErrorHtml = (error, requireHmrScript) => {
  return errorTemplateHtml(getPugCompileErrorMessage(error), requireHmrScript);
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
  PugLoaderError,
  resolveException,
  unsupportedInterpolationException,
  executeTemplateFunctionException,
  loadNodeModuleException,
  getExecuteTemplateFunctionErrorMessage,
  getPugCompileErrorMessage,
  getPugCompileErrorHtml,
  filterNotFoundException,
  filterLoadException,
  filterInitException,
};
