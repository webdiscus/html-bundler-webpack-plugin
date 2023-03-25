const ansis = require('ansis');
const { bgRed, yellow, cyan, green, ansi256, cyanBright } = require('ansis/colors');
const { pluginName } = require('../../config');

const redBright = ansi256(203);

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
 * Return error string as HTML to display the error in browser by HMR.
 *
 * @param {string} error
 * @returns {string}
 */
const errorToHtml = (error) => {
  let message = ansis.strip(error.toString()).replace(pluginName, pluginHeaderHtml).replace(/\n/g, '<br>');

  return `<!DOCTYPE html><html><head></head><body>${message}</body></html>`;
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
 * @param {string} preprocessor The given preprocessor.
 * @throws {Error}
 */
const unsupportedPreprocessorException = (preprocessor) => {
  const message =
    `${pluginHeader} Unsupported preprocessor '${yellow`${preprocessor}`}'.\n` +
    `Please see the possible values in the README on the GitHub.`;

  LoaderError(message);
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
 * @returns {Error}
 */
const notInitializedPluginError = () => {
  return new LoaderException(
    redBright(
      `${pluginHeader} Illegal usage of the loader.\n` +
        `This loader should be used only with the ${green`HtmlBundlerPlugin`} initialized in the ${yellow`Webpack 'plugins' option`}!\n` +
        `See the documentation: ${cyanBright`https://github.com/webdiscus/html-bundler-webpack-plugin`}`
    )
  );
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {Error}
 */
const preprocessorError = (error, file) => {
  return new LoaderException(
    `${pluginHeader} Preprocessor failed\nFile: ${cyan(file)}\n` + (error.stack || error.message)
  );
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {Error}
 */
const compileError = (error, file) => {
  return new LoaderException(
    `${pluginHeader} Template compilation failed\nFile: ${cyan(file)}\n` + (error.stack || error.message)
  );
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {Error}
 */
const exportError = (error, file) => {
  return new LoaderException(
    `${pluginHeader} Export of compiled template failed\nFile: ${cyan(file)}\n` + (error.stack || error.message)
  );
};

module.exports = {
  LoaderError,
  errorToHtml,
  resolveException,
  unsupportedPreprocessorException,
  watchPathsException,
  notInitializedPluginError,
  preprocessorError,
  compileError,
  exportError,
};
