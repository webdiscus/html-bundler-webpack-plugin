const { red, redBright, cyan, green, whiteBright } = require('ansis');
const { labelError } = require('./Utils');

const loaderLabel = labelError();
const filterLabel = labelError('filter');
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

module.exports = {
  PugLoaderError,
  loadNodeModuleException,
  filterNotFoundException,
  filterLoadException,
  filterInitException,
};
