const path = require('path');
const { merge } = require('webpack-merge');

const isWin = path.sep === '\\';

const isJSON = (str) => typeof str === 'string' && str.length > 1 && str[0] === '{' && str[str.length - 1] === '}';

const parseValue = (value) => (isJSON(value) ? JSON.parse(value) : value == null ? '' : value);

const outToConsole = (...args) => process.stdout.write(args.join(' ') + '\n');

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

let hmrFile = path.join(__dirname, 'hmr.js');
if (isWin) hmrFile = pathToPosix(hmrFile);

const scriptExtensionRegexp = /\.js[a-z\d]*$/i;
const isRequireableScript = (file) => !path.extname(file) || scriptExtensionRegexp.test(file);

// match: var locals_for_with = (locals || {});
const searchLocalsRegexp = /(?<=locals_for_with = )(?:\(?locals \|\| {}\)?)(?=;)/;
// match: var self = locals || {};
const searchSelfRegexp = /(?<=self = )(?:locals \|\| {})(?=;)/;

/**
 * Parse the url query.
 * See possible resource queries in the test case `parse resource data`.
 *
 * @param {string} query
 * @return {{}}
 */
const parseQuery = function (query) {
  let params = query.split('&'),
    data = {};

  params.forEach((param) => {
    if (isJSON(param)) {
      const value = JSON.parse(param);
      data = merge(data, value);
      return;
    }

    let [key, value] = param.split('=');
    if (key.indexOf('[]') > 0) {
      key = key.replace('[]', '');
      if (!data.hasOwnProperty(key)) data[key] = [];
      data[key].push(parseValue(value));
    } else if (key && key.length > 0) {
      data[key] = parseValue(value);
    }
  });

  return data;
};

/**
 * Get data from the resource query.
 *
 * @param {string} query
 * @return {{}}
 */
const getQueryData = function (query) {
  if (query[0] !== '?') return {};

  return parseQuery(query.slice(1));
};

/**
 * Inject external variables from the resource query, from the loader options
 * and merge them variables with the `locals` variable.
 *
 * @note The quality of source code of a function defined in the locals limited by function.toString().
 *   See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString
 *   If needed 100% working js function passed via loader option `data`, use loader `render` method.
 *
 * @param {string} funcBody The function as string.
 * @param {{}} locals The object of template variables.
 * @param {boolean} useSelf Whether the `self` option is true.
 * @return {string}
 */
const injectExternalData = (funcBody, locals, useSelf) => {
  const searchRegexp = useSelf === true ? searchSelfRegexp : searchLocalsRegexp;
  const quoteMark = '__REMOVE_QUOTE__';
  let hasQuoteMarks = false;

  let localsString = JSON.stringify(locals, (key, value) => {
    if (typeof value === 'function') {
      value = value.toString().replace(/\n/g, '');

      // transform `{ fn() {} }` to `{ fn: () => {} }`
      const keySize = key.length;
      if (key === value.slice(0, keySize)) {
        const pos = value.indexOf(')', keySize + 1) + 1;
        value = value.slice(keySize, pos) + '=>' + value.slice(pos);
      }

      value = quoteMark + value + quoteMark;
      hasQuoteMarks = true;
    }

    return value;
  });

  // remove the quotes around the function body
  if (hasQuoteMarks) {
    localsString = localsString.replace(/("__REMOVE_QUOTE__|__REMOVE_QUOTE__")/g, '');
  }

  return (
    'var __external_locals__ = ' +
    localsString +
    `;\n` +
    funcBody.replace(searchRegexp, '{...__external_locals__, ...locals}')
  );
};

/**
 * Resolve module path in current working directory of the Node.js process.
 *
 * @param {string} moduleName The node module name.
 * @return {string|boolean} If module exists return resolved module path otherwise false.
 * @throws
 */
const resolveModule = (moduleName) => {
  let modulePath;
  try {
    modulePath = require.resolve(moduleName, { paths: [process.cwd()] });
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return false;
    }
    throw error;
  }

  return path.dirname(modulePath);
};

module.exports = {
  outToConsole,
  hmrFile,
  isRequireableScript,
  isWin,
  pathToPosix,
  getQueryData,
  injectExternalData,
  resolveModule,
};
