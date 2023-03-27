const ansis = require('ansis');
const { yellow, cyan, green, ansi256, cyanBright, reset, whiteBright } = require('ansis/colors');
const { pluginName } = require('../../config');

const redBright = ansi256(203);
const pluginHeaderHtml = `<span style="color:#e36049">[${pluginName}]</span>`;

class LoaderException extends Error {
  /**
   * @param {string} message The plugin error message.
   * @param {Error?} error The original error.
   */
  constructor(message, error) {
    message = `\n${reset.whiteBright.bgRedBright` ${pluginName} `} ${whiteBright(message)}\n`;

    if (error && error.stack) {
      message += error.stack;
    }

    super(message);
    this.name = this.constructor.name;
  }
}

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
  const message = `The file ${yellow`'${file}'`} can't be resolved in the template ` + cyan(templateFile);

  throw new LoaderException(message, error);
};

/**
 * @param {string} preprocessor The given preprocessor.
 * @throws {Error}
 */
const unsupportedPreprocessorException = (preprocessor) => {
  const message =
    `Unsupported preprocessor '${yellow`${preprocessor}`}'.\n` +
    `Please see the possible values in the README on the GitHub.`;

  throw new LoaderException(message);
};

/**
 * @param {string} dir Not founded directory.
 * @param {Array} paths The `watchFiles.paths` option.
 */
const watchPathsException = (dir, paths) => {
  const message =
    `The watch directory not found ${yellow`'${dir}'`}.\n` +
    `Check the ${green`watchFiles.paths`} option:\n` +
    cyan(JSON.stringify(paths, null, '  '));

  throw new LoaderException(message);
};

/**
 * @returns {Error}
 */
const notInitializedPluginError = () => {
  return new LoaderException(
    redBright(
      `Illegal usage of the loader.\n` +
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
  return new LoaderException(`Preprocessor failed.\nFile: ${cyan(file)}`, error);
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {Error}
 */
const compileError = (error, file) => {
  return new LoaderException(`Template compilation failed.\nFile: ${cyan(file)}`, error);
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {Error}
 */
const exportError = (error, file) => {
  return new LoaderException(`Export of compiled template failed.\nFile: ${cyan(file)}`, error);
};

module.exports = {
  errorToHtml,
  resolveException,
  unsupportedPreprocessorException,
  watchPathsException,
  notInitializedPluginError,
  preprocessorError,
  compileError,
  exportError,
};
