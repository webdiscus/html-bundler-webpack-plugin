const WebpackError = require('webpack/lib/WebpackError');
const makeSerializable = require('webpack/lib/util/makeSerializable');

/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */

const ansis = require('ansis');
const { red, yellow, cyan, green, ansi256, cyanBright, reset, whiteBright, bgYellow } = require('ansis');
const Config = require('../../Common/Config');

const { pluginLabel } = Config.get();

const redBright = ansi256(203);
const pluginHeaderHtml = `<span style="color:#e36049">[${pluginLabel}]</span>`;

class LoaderException extends WebpackError {
  error = null;
  message = '';

  /**
   * @param {string} message The plugin error message.
   * @param {Error?} error The original error.
   */
  constructor(message, error) {
    message = `\n${reset.whiteBright.bgRedBright` ${pluginLabel} `} ${whiteBright(message)}\n`;

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
  serialize(context) {
    const { write } = context;

    write(this.error);
    write(this.message);

    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize(context) {
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
  let message = ansis.strip(error.toString()).replace(pluginLabel, pluginHeaderHtml).replace(/\n/g, '<br>');

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
 * @param {string} file
 * @return {LoaderException}
 */
const getDataFileNotFoundException = (file) => {
  const message = `Data file not found: ${cyan(file)}.`;

  return new LoaderException(message);
};

/**
 * @param {Error} error
 * @param {string} file
 * @return {LoaderException}
 */
const getDataFileException = (error, file) => {
  return new LoaderException(`Load the data file failed.\nFile: ${cyan(file)}`, error);
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
      `${yellow`If this message appears in a browser, fix the error and reload the page manually`} ${bgYellow.black` CTRL/Command + R `}\n`,
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
      `${yellow`If this message appears in a browser, fix the error and reload the page manually`} ${bgYellow.black` CTRL/Command + R `}\n`,
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
  getDataFileNotFoundException,
  getDataFileException,
  notInitializedPluginError,
  initError,
  beforePreprocessorError,
  preprocessorError,
  resolveError,
  exportError,
};
