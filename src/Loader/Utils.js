const path = require('path');
const { green, yellow, red } = require('ansis');

// constants used for imported styles in JavaScript
const baseUri = 'webpack://';
const urlPathPrefix = '/__HTML_BUNDLER_PLUGIN__/';
const cssLoaderName = 'HTMLBundlerCSSLoader';

const labelInfo = (loaderName, label) => `\n${green`[${loaderName}${label ? ':' + label : ''}]`}`;
const labelWarn = (loaderName, label) => `\n${yellow`[${loaderName}${label ? ':' + label : ''}]`}`;
const labelError = (loaderName, label) => `\n${red`[${loaderName}${label ? ':' + label : ''}]`}`;

/**
 * Resolve absolute path to node module main file what can be dynamically required anywhere in code.
 *
 * @param {string} moduleName The resolving module name.
 * @param {string} context The current working directory where is the node_modules folder.
 * @return {string | false} If module exists return resolved module path otherwise false.
 * @throws
 */
const resolveModule = (moduleName, context = process.cwd()) => {
  let moduleFile;
  try {
    moduleFile = require.resolve(moduleName, { paths: [context] });
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return false;
    }
    throw error;
  }

  return moduleFile;
};

/**
 * Call an async function for the each array item.
 *
 * @param {Array<any>} data The array of data.
 * @param {Function: Promise} fn The async function to handle the data.
 * @return {Promise<Promise<Awaited<unknown>[]>|Promise<void>>}
 */
const eachAsync = async (data, fn) => (Array.isArray(data) ? Promise.all(data.map(fn)) : Promise.resolve());

/**
 * Make template ID as relative posix path.
 *
 * @param {string} context
 * @param {string} filePath
 * @return {string}
 */
const makeTemplateId = (context, filePath) => path.relative(context, filePath).replace(/\\/g, '/');

/**
 * Inject a string before closing </head> tag.
 *
 * @param {string} content
 * @param {string} string
 * @return {string}
 */
const injectBeforeEndHead = (content, string) => injectBefore(content, string, ['</head>', '</body>', '</html>']);

/**
 * Inject a string before closing </body> tag.
 *
 * @param {string} content
 * @param {string} string
 * @return {string}
 */
const injectBeforeEndBody = (content, string) => injectBefore(content, string, ['</body>', '</html>']);

/**
 * Inject a string before one of founded strings
 *
 * @param {string} content Where should be injected a string.
 * @param {string} string The string to inject in content.
 * @param {Array<string>} before The string will be injected before the first found entry.
 *  If no entry is found, the string will be added to the end of the content.
 * @return string
 */
const injectBefore = (content, string, before = []) => {
  let pos = content.length;

  for (let str of before) {
    let currentPos = content.indexOf(str);
    if (currentPos >= 0) {
      pos = currentPos;
      break;
    }
  }

  return content.slice(0, pos) + string + content.slice(pos);
};

/**
 * Encode reserved HTML chars.
 *
 * @param {string} str
 * @return {string}
 */
const encodeReservedChars = (str) => {
  if (str.indexOf('?') < 0) return str;

  const match = /[&'"]/g;
  const replacements = { '&': '\\u0026', "'": '\\u0060', '"': '\\u0060' };
  const replacer = (value) => replacements[value];

  return str.replace(match, replacer);
};

/**
 * Decode/encode reserved HTML chars.
 *
 * @param {string} str
 * @return {string}
 */
const decodeReservedChars = (str) => {
  const match = /('|\\u0026|\\u0027|\\u0060|\n|\r|\\)/g;
  const replacements = {
    '\\u0026': '&',
    '\\u0027': "'",
    '\\u0060': "\\'",
    "'": "\\'",
    '\n': '\\n',
    '\r': '\\r',
    '\\': '\\\\',
  };
  const replacer = (value) => replacements[value];

  return str.replace(match, replacer);
};

/**
 * Transform escape sequences to printing strings.
 *
 * @param {string} str
 * @return {string}
 */
const escapeSequences = (str) => {
  const match = /(\n|\r|\t)/g;
  const replacements = {
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
  };
  const replacer = (value) => replacements[value];

  return str.replace(match, replacer);
};

/**
 * Escape codes in stringify JSON.
 *
 * @param {string} str
 * @return {string}
 */
const escapeCodesForJSON = (str) => {
  const match = /(`|\\)/g;
  const replacements = {
    '`': '\\`',
    '\\': '\\\\',
  };
  const replacer = (value) => replacements[value];

  return str.replace(match, replacer);
};

/**
 * Stringify JSON data.
 *
 * @note The quality of function source code defined in the data limited by function.toString().
 *   See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString
 *   TODO: for complex data structure should be implemented ideas from https://github.com/yahoo/serialize-javascript/blob/main/index.js
 *
 * @param {Object} data The JSON data.
 * @return {string}
 */
const stringifyJSON = (data) => {
  const quoteMark = '__REMOVE_QUOTE__';
  let hasQuoteMarks = false;

  let json = JSON.stringify(data, (key, value) => {
    if (typeof value === 'function') {
      value = value.toString().replace(/\n/g, '');

      // transform `{ fn() {} }` to `{"fn":function(){}}`
      const keySize = key.length;
      const pos = value.indexOf('(');
      if (pos > 0 && value.slice(0, pos).trim() !== 'function') {
        value = 'function' + value.slice(keySize);
      }

      value = quoteMark + value + quoteMark;
      hasQuoteMarks = true;
    }

    return value;
  });

  return hasQuoteMarks
    ? // remove the quotes around the function body
      json.replace(/("__REMOVE_QUOTE__|__REMOVE_QUOTE__")/g, '')
    : json || '{}';
};

const stringifyFn = (fn) => {
  let value = fn.toString().replace(/\n/g, '');
  let isArrowFunction = value.indexOf('=>', 1) > 0;

  if (!isArrowFunction) {
    const pos = value.indexOf('(');
    if (pos > 0 && value.slice(0, pos).trim() !== 'function') {
      value = 'function' + value.slice(pos);
    }
  }

  return value;
};

module.exports = {
  baseUri,
  urlPathPrefix,
  cssLoaderName,
  labelInfo,
  labelWarn,
  labelError,
  hotUpdateFile: path.join(__dirname, 'Hmr/hot-update.js'),
  resolveModule,
  eachAsync,
  makeTemplateId,
  injectBeforeEndHead,
  injectBeforeEndBody,
  encodeReservedChars,
  decodeReservedChars,
  escapeSequences,
  escapeCodesForJSON,
  stringifyJSON,
  stringifyFn,
};
