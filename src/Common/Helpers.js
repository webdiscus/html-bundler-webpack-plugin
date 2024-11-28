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
 * Parse version string including leading compare chars.
 * For example: '=5.96.1', '>5.96.1', '< 5.96.1', '<= 5.96.1', >= 5.96.1'
 *
 * @param version
 * @return {[compare: string, version: string]}
 */
const parseVersion = (version) => {
  let i;
  for (i = 0; i < version.length; i++) {
    let char = version.codePointAt(i);
    if (char >= 48 && char <= 57) {
      break;
    }
  }
  let compare = version.slice(0, i);
  compare = compare.trim();

  return [compare, version.slice(i)];
};

/**
 * Compare two semantic versions.
 *
 * @param {string} version1
 * @param {string} compare One of: `=`, `<`, `>`, `<=`, `>=`
 * @param {string} version2
 * @return {boolean}
 */
const compareVersions = (version1, compare, version2) => {
  const sortVersions = (x, v = (s) => s.match(/[a-z]|\d+/g).map((c) => (c == ~~c ? String.fromCharCode(97 + c) : c))) =>
    x.sort((a, b) => ((a + b).match(/[a-z]/) ? (v(b) < v(a) ? 1 : -1) : a.localeCompare(b, 0, { numeric: true })));

  const versions = [version1, version2];
  const sorted = sortVersions(versions);
  let result;

  if (version1 === version2) {
    result = 0;
  } else if (sorted[0] === version1) {
    result = -1;
  } else {
    result = 1;
  }

  switch (compare) {
    case '=':
      return result === 0;
    case '<':
      return result === -1;
    case '>':
      return result === 1;
    case '<=':
      return result === 0 || result === -1;
    case '>=':
      return result === 0 || result === 1;
  }

  return false;
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
  outToConsole,
  parseVersion,
  compareVersions,
};
