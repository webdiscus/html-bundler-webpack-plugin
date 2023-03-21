const path = require('path');
const JSON5 = require('json5');

const isWin = path.sep === '\\';

/**
 * Converts the win path to POSIX standard.
 * The require() function understands only POSIX format.
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
 * Parse the url query.
 *
 * @param {string} request
 * @returns {{}}
 */
const parseQuery = (request) => {
  const [, query] = request.split('?', 2);
  if (!query) return {};

  if (isJSON(query)) {
    // TODO: write own micro parser to avoid external dependency of json5 module
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

    if (value) {
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
 * Parse resource path and raw query from request.
 *
 * @param {string} request
 * @return {{resource: string, query: string|null}}
 */
const parseRequest = (request) => {
  const [resource, query] = request.split('?');
  return { resource, query };
};

module.exports = {
  isWin,
  isFunction,
  pathToPosix,
  parseQuery,
  parseRequest,
  outToConsole,
};
