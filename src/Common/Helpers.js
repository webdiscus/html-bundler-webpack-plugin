const path = require('path');
const { parseRequest } = require('./RequestParser');

const isWin = path.sep === '\\';

/**
 * Converts the win path to the POSIX standard.
 * The require() function understands only the POSIX format.
 *
 * Fix path, for example:
 *   - `..\\some\\path\\file.js` to `../some/path/file.js`
 *   - `C:\\some\\path\\file.js` to `C:/some/path/file.js`
 *
 * @param {string} value A path string.
 * @return {string}
 */
const pathToPosix = (value) => value.replace(/\\/g, '/');

const isFunction = (value) => typeof value === 'function';

/**
 * Find a webpack plugin by instance name.
 *
 * @param {Array<Object>} plugins The webpack compiler.options.plugins.
 * @param {string} name The class name of the plugin.
 * @return {Object|null}
 */
const findPlugin = (plugins, name) => plugins.find((item) => item.constructor.name === name);

/**
 * Output to console.
 *
 * @param {*} args
 * @return {boolean}
 */
const outToConsole = (...args) => process.stdout.write(args.join(' ') + '\n');

/**
 * Returns a file extension without leading '.'.
 *
 * Note: this implementation fixes many issues of node path.parse().
 *
 * @param {string} resource The resource file, including a query.
 * @param {boolean} win Whether the path is in windows format. This parameter is autodetect.
 *  It is used for unit testing only.
 * @return {string}
 */
const getFileExtension = (resource, win = isWin) => {
  let [file] = resource.split('?', 1);
  if (win) file = pathToPosix(file);
  const { ext } = path.parse(file);

  return ext === '' ? '' : ext.slice(1);
};

/**
 * Get the query parameter the request.
 *
 * @param {string} request
 * @param {string} name
 * @return {string}
 */
const getQueryParam = (request, name) => {
  const [, query] = request.split('?', 2);
  const urlParams = new URLSearchParams(query);

  return urlParams.get(name);
};

/**
 * Add to the request a query parameter.
 *
 * @param {string} request
 * @param {string} name
 * @param {*} value
 * @return {string}
 */
const addQueryParam = (request, name, value) => {
  const [file, query] = request.split('?', 2);
  const urlParams = new URLSearchParams(query);

  urlParams.append(name, value);

  return file + '?' + urlParams.toString();
};

/**
 * Delete form the request a query parameter.
 *
 * @param {string} request
 * @param {string} name
 * @return {string}
 */
const deleteQueryParam = (request, name) => {
  const [file, query] = request.split('?', 2);
  const urlParams = new URLSearchParams(query);

  urlParams.delete(name);

  const newQuery = urlParams.toString();

  return newQuery ? file + '?' + newQuery : file;
};

/**
 * Returns an indent detected in the content.
 *
 * @param {string} content The template content.
 * @param {number} startPos The start position of a tag. An indent will be detected before the tag position.
 * @return {string}
 */
const detectIndent = (content, startPos) => {
  const idents = [' ', '\t'];
  let pos = startPos;

  while (idents.indexOf(content.charAt(pos)) > -1 && pos > 0) pos--;

  return pos < startPos ? content.slice(pos + 1, startPos + 1) : '';
};

/**
 * The polyfill for node < 15.
 *
 * @param {string} str
 * @param {string} search
 * @param {string} replace
 * @returns {string}
 */
const replaceAll = (str, search, replace) => {
  return str.replace(new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

module.exports = {
  isWin,
  isFunction,
  findPlugin,
  pathToPosix,
  getFileExtension,
  parseQuery: (request) => parseRequest(request).query,
  getQueryParam,
  addQueryParam,
  deleteQueryParam,
  detectIndent,
  replaceAll,
  outToConsole,
};
