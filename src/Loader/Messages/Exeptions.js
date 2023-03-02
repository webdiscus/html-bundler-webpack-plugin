const ansis = require('ansis');
const { bgRed, redBright, yellow, cyan, green } = require('ansis/colors');
const { pluginName } = require('../../config');

const pluginHeaderHtml = `<span style="color:#e36049">[${pluginName}]</span>`;
const pluginHeader = `\n${bgRed.whiteBright` ${pluginName} `}`;
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
  lastError = message;

  if (error) lastError += `\n\n${redBright`Original Error:`}\n` + error;

  throw new LoaderException(lastError);
};

/**
 * @param {LoaderException|Error} error The original error.
 * @param {string} file The resource file.
 * @param {string} templateFile The template file.
 * @throws {Error}
 */
const resolveException = (error, file, templateFile) => {
  const message =
    `${pluginHeader} The file ${yellow`'${file}'`} can't be resolved in the template ` + cyan(templateFile);

  LoaderError(message, error);
};

/**
 * @param {string} dir Not founded directory.
 * @param {Array} paths The `watchFiles.paths` option.
 */
const watchPathsException = (dir, paths) => {
  const message =
    `${pluginHeader} The watch directory not found ${yellow`'${dir}'`}.\n` +
    `Check the ${green`watchFiles.paths`} option:\n` +
    cyan(JSON.stringify(paths, null, '  '));

  LoaderError(message, '');
};

/**
 * Return error string as HTML to display the error in browser by HMR.
 *
 * @param {string} error
 * @param {string} hmr
 * @returns {string}
 */
const errorToHtml = (error, hmr) => {
  let message = ansis.strip(error.toString());
  message = message.replace(`${pluginName}`, pluginHeaderHtml);
  message = message.replace(/\n/g, '<br>').replace(/'/g, "\\'");

  return `<!DOCTYPE html><html>
<head><script src="${hmr}"></script></head>
<body><div>${message}</div></body></html>`.replace(/\n/g, '');
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {string}
 */
const preprocessorErrorToString = (error, file) => {
  return `${pluginHeader} Preprocessor failed\nFile: ${cyan(file)}\n` + error.toString();
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {string}
 */
const compileErrorToString = (error, file) => {
  return `${pluginHeader} Template compilation failed\nFile: ${cyan(file)}\n` + error.toString();
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {string}
 */
const exportErrorToString = (error, file) => {
  return `${pluginHeader} Export of compiled template failed\nFile: ${cyan(file)}\n` + error.toString();
};

module.exports = {
  LoaderError,
  errorToHtml,
  resolveException,
  watchPathsException,
  preprocessorErrorToString,
  compileErrorToString,
  exportErrorToString,
};
