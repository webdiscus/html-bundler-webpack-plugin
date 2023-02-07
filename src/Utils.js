const path = require('path');
const JSON5 = require('json5');

const isWin = path.sep === '\\';
const workingDir = process.env.PWD;

/**
 * Converts the win path to POSIX standard.
 * The require() function understands only POSIX format.
 *
 * Fix path, for example:
 *   - `..\\some\\path\\file.js` to `../some/path/file.js`
 *   - `C:\\some\\path\\file.js` to `C:/some/path/file.js`
 *
 * @param {string} value The path on Windows.
 * @return {*}
 */
const pathToPosix = (value) => value.replace(/\\/g, '/');

/**
 * Return path of file relative by working directory.
 *
 * @param {string} file
 * @return {string}
 */
const pathRelativeByPwd = (file) => {
  if (file.startsWith(workingDir)) {
    let relPath = path.relative(workingDir, file);

    return path.extname(file) ? relPath : path.join(relPath, path.sep);
  }

  return file;
};

const isFunction = (value) => typeof value === 'function';

const outToConsole = (...args) => process.stdout.write(args.join(' ') + '\n');

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

/**
 * Parse request query.
 *
 * @param {string} request
 * @returns {{}}
 */
const parseQuery = (request) => {
  const [, query] = request.split('?');
  if (!query) return {};

  if (query[0] === '{' && query.slice(-1) === '}') {
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
 * Transform source code from ESM to CommonJS.
 *
 * @param {string} code ESM code.
 * @returns {string} CommonJS code.
 */
const toCommonJS = (code) => {
  // import to require
  const importMatches = code.matchAll(/import (.+) from "(.+)";/g);
  for (const [match, variable, file] of importMatches) {
    code = code.replace(match, `var ${variable} = require('${file}');`);
  }
  // new URL to require
  const urlMatches = code.matchAll(/= new URL\("(.+?)"(?:.*?)\);/g);
  for (const [match, file] of urlMatches) {
    code = code.replace(match, `= require('${file}');`);
  }

  // TODO: implement clever method to replace module `export default`, but not in a text
  //   use cases:
  //     export default '<h1>Hello World!</h1>'; // OK
  //     export default '<h1>Code example: `var code = "hello";export default code;` </h1>'; // <= fix it
  code = code.replace(/export default (.+);/, 'module.exports = $1;');

  return code;
};

module.exports = {
  isWin,
  pathToPosix,
  pathRelativeByPwd,
  parseQuery,
  parseRequest,
  isFunction,
  toCommonJS,
  outToConsole,
};
