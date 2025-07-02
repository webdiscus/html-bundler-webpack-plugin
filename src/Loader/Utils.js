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

/**
 * Removes all JavaScript comments (single-line and multi-line) from code,
 * while preserving strings containing comment-like patterns.
 *
 * @param {string} code The source code.
 * @returns {string} The code with all comments removed.
 *
 * @example
 * // Removes only real comments, not content inside strings:
 * const input = "const x = 'text // not a comment'; // real comment";
 * const output = stripComments(input);
 * // => "const x = 'text // not a comment'; "
 */
function stripComments2(code) {
  const len = code.length;
  let inStr = null; // quote: ', ", or `
  let inRegex = false; // inside /.../ regex literal
  let inRegexClass = false; // inside [...] character class
  let inLineComment = false; // inside //
  let inBlockComment = false; // inside /* */
  let out = '';
  let i = 0;

  while (i < len) {
    const char = code[i];
    const next = code[i + 1];
    const prev = code[i - 1];

    // line comment end
    if (inLineComment && (char === '\n' || char === '\r')) {
      inLineComment = false;
      out += char;
      i++;
      continue;
    }

    // block comment end
    if (inBlockComment && char === '*' && next === '/') {
      inBlockComment = false;
      i += 2;
      continue;
    }

    if (inLineComment || inBlockComment) {
      i++;
      continue;
    }

    // string start
    if (!inStr && (char === '"' || char === "'" || char === '`')) {
      inStr = char;
      out += char;
      i++;
      continue;
    }

    // string end
    if (inStr) {
      out += char;
      if (char === '\\') {
        // copy escaped char
        if (i + 1 < len) {
          out += code[i + 1];
          i += 2;
          continue;
        }
      } else if (char === inStr) {
        inStr = null;
      }
      i++;
      continue;
    }

    // RegExp start
    if (char === '/' && next !== '/' && next !== '*') {
      // scan backward for prev non-whitespace char
      let j = i - 1;
      while (j >= 0 && /\s/.test(code[j])) j--;
      const prevChar = j >= 0 ? code[j] : '';
      // treat as Regex if after following chars
      if (j < 0 || /[=({\[:~%^\-*,!&|?;<>]/.test(prevChar)) {
        inRegex = true;
        inRegexClass = false;
        out += char;
        i++;
        continue;
      }
      // otherwise treat as division
    }

    // RegExp end
    if (inRegex) {
      out += char;
      if (inRegexClass) {
        if (char === ']' && prev !== '\\') inRegexClass = false;
      } else {
        if (char === '[' && prev !== '\\') {
          inRegexClass = true;
        } else if (char === '/' && prev !== '\\') {
          inRegex = false;
          // copy regex flags
          let k = i + 1;
          while (k < len && /[a-z]/i.test(code[k])) {
            out += code[k];
            k++;
          }
          i = k;
          continue;
        }
      }
      i++;
      continue;
    }

    // line comment start
    if (char === '/' && next === '/') {
      inLineComment = true;
      i += 2;
      continue;
    }

    // block comment start
    if (char === '/' && next === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }

    out += char;
    i++;
  }

  return out;
}

/**
 * Removes all JavaScript comments (single-line and multi-line) from code,
 * while preserving strings and regex literals with comment-like patterns.
 *
 * @param {string} code The source code.
 * @returns {string} The code with all comments removed.
 */
function stripComments(code) {
  let out = '';
  let inStr = null; // current quote: ', ", or `
  let inRegex = false; // inside a /.../ regex literal
  let inRegexClass = false; // inside a [...] character class within regex
  let inLineComment = false; // inside //
  let inBlockComment = false; // inside /* */
  let prev = '';
  let i = 0;
  const len = code.length;

  while (i < len) {
    const char = code[i];
    const next = code[i + 1];

    // -- Line Comment --
    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        out += char;
      }
      i++;
      continue;
    }

    // -- Block Comment --
    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    // -- String Start --
    if (!inStr && !inRegex && (char === '"' || char === "'" || char === '`')) {
      inStr = char;
      out += char;
      i++;
      continue;
    }

    // -- Inside String --
    if (inStr) {
      out += char;
      if (char === '\\') {
        // Copy escaped char
        if (i + 1 < len) {
          out += code[i + 1];
          i += 2;
        } else {
          i++;
        }
        continue;
      } else if (char === inStr) {
        inStr = null;
      }
      i++;
      continue;
    }

    // -- Regex Start (not after identifier, ), ], +, - or number) --
    if (!inRegex && char === '/' && next !== '/' && next !== '*') {
      // Scan backward for prev non-whitespace char
      let j = i - 1;
      while (j >= 0 && /\s/.test(code[j])) j--;
      const prevChar = j >= 0 ? code[j] : '';
      // Only treat as regex if after certain tokens or start of input
      if (j < 0 || /[=({\[:;,!&|?~%^<>*/]/.test(prevChar)) {
        inRegex = true;
        out += char;
        i++;
        continue;
      }
      // otherwise: treat as division
    }

    // -- Inside Regex --
    if (inRegex) {
      out += char;
      if (inRegexClass) {
        if (char === ']' && prev !== '\\') inRegexClass = false;
      } else {
        if (char === '[' && prev !== '\\') {
          inRegexClass = true;
        } else if (char === '/' && prev !== '\\') {
          inRegex = false;
          // Copy regex flags
          let k = i + 1;
          while (k < len && /[a-z]/i.test(code[k])) {
            out += code[k];
            k++;
          }
          i = k;
          continue;
        }
      }
      prev = char;
      i++;
      continue;
    }

    // -- Line Comment Start --
    if (char === '/' && next === '/') {
      inLineComment = true;
      i += 2;
      continue;
    }

    // -- Block Comment Start --
    if (char === '/' && next === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }

    // -- Default: copy --
    out += char;
    i++;
  }
  return out;
}

/**
 * Stringify any JavaScript function.
 *
 * @param {Function} fn - The function to stringify.
 * @returns {string|null} The cleaned stringified function or null if not a function or native.
 */
const stringifyFn = (fn) => {
  if (typeof fn !== 'function') return null;

  try {
    const raw = fn.toString();

    // skip native or bound functions
    if (raw.includes('[native code]') || raw.includes('[object Function]')) {
      return null;
    }

    // safe comment removal
    let cleaned = stripComments(raw);

    // remove leading indent and join into one line
    cleaned = cleaned
      .split('\n')
      .map((line) => line.trimStart())
      .join(' ')
      .trim();

    // check if it is top-level arrow function
    const isArrowFunction = /^(\(?[^=(){};]*\)?)\s*=>/.test(cleaned);

    // replace method shorthand to function expression
    // Example: getFoo(a, b) { ... } -> function(a, b) { ... }
    if (!isArrowFunction) {
      const pos = cleaned.indexOf('(');
      if (pos > 0 && cleaned.slice(0, pos).trim() !== 'function') {
        cleaned = 'function' + cleaned.slice(pos);
      }
    }

    return cleaned;
  } catch {
    return null;
  }
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
  stripComments,
  encodeReservedChars,
  decodeReservedChars,
  escapeSequences,
  escapeCodesForJSON,
  stringifyJSON,
  stringifyFn,
};
