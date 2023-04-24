const path = require('path');
const JSON5 = require('json5');

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

const isJSON = (str) => typeof str === 'string' && str.length > 1 && str[0] === '{' && str[str.length - 1] === '}';

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
 * Parse the url query.
 *
 * @param {string} request
 * @returns {{}}
 */
const parseQuery = (request) => {
  const [, query] = request.split('?', 2);
  if (!query) return {};

  if (isJSON(query)) {
    return JSON5.parse(decodeURIComponent(query));
  }

  const specialValues = {
    null: null,
    true: true,
    false: false,
  };
  const queryArgs = query.split(/[,&]/g);
  const result = {};

  for (let arg of queryArgs) {
    let [name, value] = arg.split('=');

    if (value == null) {
      result[name] = true;
    } else if (value) {
      value = decodeURIComponent(value);

      if (specialValues.hasOwnProperty(value)) {
        value = specialValues[value];
      }

      if (name.slice(-2) === '[]') {
        name = decodeURIComponent(name.slice(0, -2));
        if (!Array.isArray(result[name])) {
          result[name] = [];
        }
        result[name].push(value);
      } else {
        name = decodeURIComponent(name);
        result[name] = value;
      }
    }
  }

  return result;
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

module.exports = {
  isWin,
  isFunction,
  pathToPosix,
  getFileExtension,
  parseQuery,
  detectIndent,
  outToConsole,
};
