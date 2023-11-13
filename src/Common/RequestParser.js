/**
 * Request parser.
 * Supports JSON5 query string.
 *
 * This mini utility used a minimized version of json5.parse package to parse only a single-line query string.
 * Original file: https://github.com/json5/json5/blob/main/lib/parse.js
 */

/**
 * Parse the request.
 *
 * @param {string} request The request containing a query string.
 * @returns {{url: string, query: {}}}
 */
const parseRequest = (request) => {
  const [url, query] = request.split('?', 2);
  if (!query) return { url, query: {} };

  if (isJSON(query)) {
    return { url, query: parseJSON5Query(decodeURIComponent(query)) || {} };
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

    // skip empty key when used `&` w/o a name, e.g. ?&k=val
    if (name.length < 1) continue;

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

  return { url, query: result };
};

const isJSON = (str) => typeof str === 'string' && str.length > 1 && str[0] === '{' && str[str.length - 1] === '}';
const isDigit = (c) => typeof c === 'string' && /[0-9]/.test(c);
const isHexDigit = (c) => typeof c === 'string' && /[0-9A-Fa-f]/.test(c);
const isIdStartChar = (c) =>
  typeof c === 'string' && ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '$' || c === '_');
const isIdContinueChar = (c) =>
  typeof c === 'string' &&
  ((c >= 'a' && c <= 'z') ||
    (c >= 'A' && c <= 'Z') ||
    (c >= '0' && c <= '9') ||
    c === '$' ||
    c === '_' ||
    c === '\u200C' ||
    c === '\u200D');

let source;
let parseState;
let stack;
let pos;
let column;
let token;
let key;
let root;

let lexState;
let buffer;
let doubleQuote;
let sign;
let c;

/**
 *
 * @param {string} text
 * @returns {{}|undefined}
 */
const parseJSON5Query = (text) => {
  source = String(text);
  parseState = 'start';
  stack = [];
  pos = 0;
  column = 0;
  token = undefined;
  key = undefined;
  root = undefined;

  do {
    token = lex();
    parseStates[parseState]();
  } while (token.type !== 'eof');

  return root;
};

const lex = () => {
  lexState = 'default';
  buffer = '';
  doubleQuote = false;
  sign = 1;

  for (;;) {
    c = peek();

    const token = lexStates[lexState]();
    if (token) {
      return token;
    }
  }
};

const peek = () => (source[pos] ? String.fromCodePoint(source.codePointAt(pos)) : undefined);

const read = () => {
  const c = peek();

  if (c) {
    column += c.length;
    pos += c.length;
  } else {
    column++;
  }

  return c;
};

const lexStates = {
  default() {
    switch (c) {
      case '\t':
      case ' ':
        read();
        return;

      case '/':
        read();
        lexState = 'comment';
        return;

      case undefined:
        read();
        return newToken('eof');
    }

    return lexStates[parseState]();
  },

  comment() {
    switch (c) {
      case '*':
        read();
        lexState = 'multiLineComment';
        return;
    }

    throw invalidChar(read());
  },

  multiLineComment() {
    switch (c) {
      case '*':
        read();
        lexState = 'multiLineCommentAsterisk';
        return;

      case undefined:
        throw invalidChar(read());
    }

    read();
  },

  multiLineCommentAsterisk() {
    switch (c) {
      case '*':
        read();
        return;

      case '/':
        read();
        lexState = 'default';
        return;

      case undefined:
        throw invalidChar(read());
    }

    read();
    lexState = 'multiLineComment';
  },

  value() {
    switch (c) {
      case '{':
      case '[':
        return newToken('punctuator', read());

      case 'n':
        read();
        literal('ull');
        return newToken('null', null);

      case 't':
        read();
        literal('rue');
        return newToken('boolean', true);

      case 'f':
        read();
        literal('alse');
        return newToken('boolean', false);

      case '-':
      case '+':
        if (read() === '-') {
          sign = -1;
        }

        lexState = 'sign';
        return;

      case '.':
        buffer = read();
        lexState = 'decimalPointLeading';
        return;

      case '0':
        buffer = read();
        lexState = 'zero';
        return;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        buffer = read();
        lexState = 'decimalInteger';
        return;

      case 'I':
        read();
        literal('nfinity');
        return newToken('numeric', Infinity);

      case 'N':
        read();
        literal('aN');
        return newToken('numeric', NaN);

      case '"':
      case "'":
        doubleQuote = read() === '"';
        buffer = '';
        lexState = 'string';
        return;
    }

    throw invalidChar(read());
  },

  identifierName() {
    switch (c) {
      case '$':
      case '_':
      case '\u200C':
      case '\u200D':
        buffer += read();
        return;
    }

    if (isIdContinueChar(c)) {
      buffer += read();
      return;
    }

    return newToken('identifier', buffer);
  },

  sign() {
    switch (c) {
      case '.':
        buffer = read();
        lexState = 'decimalPointLeading';
        return;

      case '0':
        buffer = read();
        lexState = 'zero';
        return;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        buffer = read();
        lexState = 'decimalInteger';
        return;

      case 'I':
        read();
        literal('nfinity');
        return newToken('numeric', sign * Infinity);

      case 'N':
        read();
        literal('aN');
        return newToken('numeric', NaN);
    }

    throw invalidChar(read());
  },

  zero() {
    switch (c) {
      case '.':
        buffer += read();
        lexState = 'decimalPoint';
        return;

      case 'e':
      case 'E':
        buffer += read();
        lexState = 'decimalExponent';
        return;

      case 'x':
      case 'X':
        buffer += read();
        lexState = 'hexadecimal';
        return;
    }

    return newToken('numeric', sign * 0);
  },

  decimalInteger() {
    switch (c) {
      case '.':
        buffer += read();
        lexState = 'decimalPoint';
        return;

      case 'e':
      case 'E':
        buffer += read();
        lexState = 'decimalExponent';
        return;
    }

    if (isDigit(c)) {
      buffer += read();
      return;
    }

    return newToken('numeric', sign * Number(buffer));
  },

  decimalPointLeading() {
    if (isDigit(c)) {
      buffer += read();
      lexState = 'decimalFraction';
      return;
    }

    throw invalidChar(read());
  },

  decimalPoint() {
    switch (c) {
      case 'e':
      case 'E':
        buffer += read();
        lexState = 'decimalExponent';
        return;
    }

    if (isDigit(c)) {
      buffer += read();
      lexState = 'decimalFraction';
      return;
    }

    return newToken('numeric', sign * Number(buffer));
  },

  decimalFraction() {
    switch (c) {
      case 'e':
      case 'E':
        buffer += read();
        lexState = 'decimalExponent';
        return;
    }

    if (isDigit(c)) {
      buffer += read();
      return;
    }

    return newToken('numeric', sign * Number(buffer));
  },

  decimalExponent() {
    switch (c) {
      case '+':
      case '-':
        buffer += read();
        lexState = 'decimalExponentSign';
        return;
    }

    if (isDigit(c)) {
      buffer += read();
      lexState = 'decimalExponentInteger';
      return;
    }

    throw invalidChar(read());
  },

  decimalExponentSign() {
    if (isDigit(c)) {
      buffer += read();
      lexState = 'decimalExponentInteger';
      return;
    }

    throw invalidChar(read());
  },

  decimalExponentInteger() {
    if (isDigit(c)) {
      buffer += read();
      return;
    }

    return newToken('numeric', sign * Number(buffer));
  },

  hexadecimal() {
    if (isHexDigit(c)) {
      buffer += read();
      lexState = 'hexadecimalInteger';
      return;
    }

    throw invalidChar(read());
  },

  hexadecimalInteger() {
    if (isHexDigit(c)) {
      buffer += read();
      return;
    }

    return newToken('numeric', sign * Number(buffer));
  },

  string() {
    switch (c) {
      case '"':
        if (doubleQuote) {
          read();
          return newToken('string', buffer);
        }

        buffer += read();
        return;

      case "'":
        if (!doubleQuote) {
          read();
          return newToken('string', buffer);
        }

        buffer += read();
        return;

      case undefined:
        throw invalidChar(read());
    }

    buffer += read();
  },

  start() {
    switch (c) {
      case '{':
      case '[':
        return newToken('punctuator', read());
    }

    lexState = 'value';
  },

  beforePropertyName() {
    switch (c) {
      case '}':
        return newToken('punctuator', read());

      case '"':
      case "'":
        doubleQuote = read() === '"';
        lexState = 'string';
        return;
    }

    if (isIdStartChar(c)) {
      buffer += read();
      lexState = 'identifierName';
      return;
    }

    throw invalidChar(read());
  },

  afterPropertyName() {
    if (c === ':') {
      return newToken('punctuator', read());
    }

    throw invalidChar(read());
  },

  beforePropertyValue() {
    lexState = 'value';
  },

  afterPropertyValue() {
    switch (c) {
      case ',':
      case '}':
        return newToken('punctuator', read());
    }

    throw invalidChar(read());
  },

  beforeArrayValue() {
    if (c === ']') {
      return newToken('punctuator', read());
    }

    lexState = 'value';
  },

  afterArrayValue() {
    switch (c) {
      case ',':
      case ']':
        return newToken('punctuator', read());
    }

    throw invalidChar(read());
  },

  end() {
    throw invalidChar(read());
  },
};

const newToken = (type, value) => ({
  type,
  value,
  column,
});

const literal = (s) => {
  for (const c of s) {
    const p = peek();

    if (p !== c) {
      throw invalidChar(read());
    }

    read();
  }
};

const parseStates = {
  start() {
    if (token.type === 'eof') {
      throw invalidEOF();
    }

    push();
  },

  beforePropertyName() {
    switch (token.type) {
      case 'identifier':
      case 'string':
        key = token.value;
        parseState = 'afterPropertyName';
        return;

      case 'punctuator':
        pop();
        return;

      case 'eof':
        throw invalidEOF();
    }
  },

  afterPropertyName() {
    if (token.type === 'eof') {
      throw invalidEOF();
    }

    parseState = 'beforePropertyValue';
  },

  beforePropertyValue() {
    if (token.type === 'eof') {
      throw invalidEOF();
    }

    push();
  },

  beforeArrayValue() {
    if (token.type === 'eof') {
      throw invalidEOF();
    }

    if (token.type === 'punctuator' && token.value === ']') {
      pop();
      return;
    }

    push();
  },

  afterPropertyValue() {
    if (token.type === 'eof') {
      throw invalidEOF();
    }

    switch (token.value) {
      case ',':
        parseState = 'beforePropertyName';
        return;

      case '}':
        pop();
    }
  },

  afterArrayValue() {
    if (token.type === 'eof') {
      throw invalidEOF();
    }

    switch (token.value) {
      case ',':
        parseState = 'beforeArrayValue';
        return;

      case ']':
        pop();
    }
  },

  end() {},
};

const push = () => {
  let value;

  switch (token.type) {
    case 'punctuator':
      switch (token.value) {
        case '{':
          value = {};
          break;

        case '[':
          value = [];
          break;
      }

      break;

    case 'null':
    case 'boolean':
    case 'numeric':
    case 'string':
      value = token.value;
      break;
  }

  if (root === undefined) {
    root = value;
  } else {
    const parent = stack[stack.length - 1];
    if (Array.isArray(parent)) {
      parent.push(value);
    } else {
      Object.defineProperty(parent, key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
  }

  if (value !== null && typeof value === 'object') {
    stack.push(value);

    if (Array.isArray(value)) {
      parseState = 'beforeArrayValue';
    } else {
      parseState = 'beforePropertyName';
    }
  } else {
    const current = stack[stack.length - 1];
    if (current == null) {
      parseState = 'end';
    } else if (Array.isArray(current)) {
      parseState = 'afterArrayValue';
    } else {
      parseState = 'afterPropertyValue';
    }
  }
};

const pop = () => {
  stack.pop();

  const current = stack[stack.length - 1];
  if (current == null) {
    parseState = 'end';
  } else if (Array.isArray(current)) {
    parseState = 'afterArrayValue';
  } else {
    parseState = 'afterPropertyValue';
  }
};

const invalidChar = (c) => {
  const message =
    c === undefined
      ? `JSON5: invalid end of input at position ${column}`
      : `JSON5: invalid character '${formatChar(c)}' at position ${column}`;

  return syntaxError(message);
};

const invalidEOF = () => `JSON5: invalid end of input at position ${column}`;

const formatChar = (c) => {
  const replacements = {
    "'": "\\'",
    '"': '\\"',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\v': '\\v',
    '\0': '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029',
  };

  return replacements[c] ? replacements[c] : c;
};

const syntaxError = (message) => {
  const err = new SyntaxError(message);
  err.lineNumber = 1;
  err.columnNumber = column;

  return err;
};

module.exports = {
  parseRequest,
  parseJSON5Query,
};
