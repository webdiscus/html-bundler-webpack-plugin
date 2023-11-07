const WebpackError = require('webpack/lib/WebpackError');
const makeSerializable = require('webpack/lib/util/makeSerializable');

/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */

const ansis = require('ansis');
const { red, yellow, cyan, green, ansi256, cyanBright, reset, whiteBright, bgYellow } = require('ansis');
const { pluginName } = require('../../config');

const redBright = ansi256(203);
const pluginHeaderHtml = `<span style="color:#e36049">[${pluginName}]</span>`;

class LoaderException extends WebpackError {
  error = null;
  message = '';

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

  /**
   * @param {ObjectSerializerContext} context context
   */
  static serialize(context) {
    const { write } = context;

    write(this.error);
    write(this.message);

    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   */
  static deserialize(context) {
    const { read } = context;

    this.error = read();
    this.message = read();

    super.deserialize(context);
  }
}

/**
 * Return error string as HTML to display the error in browser by serve/watch mode.
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
  const message = `Can't resolve ${yellow`'${file}'`} in the template ` + cyan(templateFile);

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
 * @param {string} file
 * @throws {Error}
 */
const dataFileNotFoundException = (file) => {
  const message = `The data file not found: ${cyan(file)}.`;

  throw new LoaderException(message);
};

/**
 * @param {Error} error
 * @param {string} file
 * @throws {Error}
 */
const dataFileException = (error, file) => {
  throw new LoaderException(`Load the data file failed.\nFile: ${cyan(file)}`, error);
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
const initError = (error, file) => {
  return new LoaderException(`Loader initialisation failed.\nFile: ${cyan(file)}`, error);
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {Error}
 */
const beforePreprocessorError = (error, file) => {
  return new LoaderException(
    red`beforePreprocessor failed.` +
      `\n` +
      `File: ${cyan(file)}\n\n` +
      `${yellow`If you see this message after fixing the error, try to reload your browser manually`} ${bgYellow.black` CTRL/Command + R `}\n`,
    error
  );
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {Error}
 */
const preprocessorError = (error, file) => {
  return new LoaderException(
    red`Preprocessor failed.` +
      `\n` +
      `File: ${cyan(file)}\n\n` +
      `${yellow`If you see this message after fixing the error, try to reload your browser manually`} ${bgYellow.black` CTRL/Command + R `}\n`,
    error
  );
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {Error}
 */
const resolveError = (error, file) => {
  return new LoaderException(`Resolving of source files in the template file failed.\nFile: ${cyan(file)}`, error);
};

/**
 * @param {Error} error
 * @param {string} file
 * @returns {Error}
 */
const exportError = (error, file) => {
  return new LoaderException(`Export of compiled template failed.\nFile: ${cyan(file)}`, error);
};

// This is required when used cache as `filesystem` to avoid Webpack warning:
// "No serializer registered for LoaderException."
makeSerializable(LoaderException, __filename);

module.exports = {
  errorToHtml,
  resolveException,
  unsupportedPreprocessorException,
  watchPathsException,
  dataFileNotFoundException,
  dataFileException,
  notInitializedPluginError,
  initError,
  beforePreprocessorError,
  preprocessorError,
  resolveError,
  exportError,
};
