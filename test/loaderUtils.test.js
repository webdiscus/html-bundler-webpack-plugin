import {
  stringifyJSON,
  stringifyFn,
  injectBeforeEndHead,
  injectBeforeEndBody,
  escapeSequences,
  escapeCodesForJSON,
} from '../src/Loader/Utils';

describe('stringifyJSON', () => {
  test('{ fn() {} }', () => {
    const json = { fn() {} };
    const received = stringifyJSON(json);
    const expected = `{"fn":function() {}}`;
    return expect(received).toEqual(expected);
  });

  test('{ fn: () => {} }', () => {
    const json = { fn: () => {} };
    const received = stringifyJSON(json);
    const expected = `{"fn":() => {}}`;
    return expect(received).toEqual(expected);
  });

  test('{ fn: function() {} }', () => {
    const json = { fn: function () {} };
    const received = stringifyJSON(json);
    const expected = `{"fn":function () {}}`;
    return expect(received).toEqual(expected);
  });
});

describe('stringifyFn', () => {
  test('basic named function', () => {
    function sum(a, b) {
      return a + b;
    }

    expect(stringifyFn(sum)).toBe('function(a, b) { return a + b; }');
  });

  test('arrow function', () => {
    const arrow = (x) => x * 2;
    expect(stringifyFn(arrow)).toBe('x => x * 2');
  });

  test('multiline arrow function', () => {
    const fn = (x, y) => {
      return x * y;
    };
    expect(stringifyFn(fn)).toBe('(x, y) => { return x * y; }');
  });

  test('shorthand method in object', () => {
    const obj = {
      getName(first, last) {
        return first + ' ' + last;
      },
    };
    expect(stringifyFn(obj.getName)).toBe("function(first, last) { return first + ' ' + last; }");
  });

  test('named function with inner arrow function', () => {
    function outer(x) {
      const inner = (y) => y + 1;
      return inner(x);
    }
    expect(stringifyFn(outer)).toBe('function(x) { const inner = y => y + 1; return inner(x); }');
  });

  test('native function returns null', () => {
    expect(stringifyFn(Math.max)).toBeNull();
  });

  test('bound function returns null', () => {
    function fn(x) {
      return x;
    }
    const bound = fn.bind(null);
    expect(stringifyFn(bound)).toBeNull();
  });

  test('anonymous function expression', () => {
    const anon = function (x, y) {
      return x - y;
    };
    expect(stringifyFn(anon)).toBe('function (x, y) { return x - y; }');
  });

  test('null input returns null', () => {
    expect(stringifyFn(null)).toBeNull();
  });

  // old tests
  test('{ fn() {} }', () => {
    const obj = { fn() {} };
    const received = stringifyFn(obj.fn);
    const expected = `function() {}`;
    return expect(received).toEqual(expected);
  });

  test('{ fn: function() {} }', () => {
    const obj = { fn: function () {} };
    const received = stringifyFn(obj.fn);
    const expected = `function () {}`;
    return expect(received).toEqual(expected);
  });

  test('{ fn: () => {} }', () => {
    const obj = { fn: () => {} };
    const received = stringifyFn(obj.fn);
    const expected = `() => {}`;
    return expect(received).toEqual(expected);
  });

  test('{ fn: o => o.toString() }', () => {
    const obj = { fn: (o) => o.toString() };
    const received = stringifyFn(obj.fn);
    const expected = `o => o.toString()`;
    return expect(received).toEqual(expected);
  });

  test('non-function input returns null', () => {
    expect(stringifyFn(42)).toBeNull();
    expect(stringifyFn({})).toBeNull();
    expect(stringifyFn('foo')).toBeNull();
  });
});

describe('stringifyFn - removes all comment types', () => {
  test('removes single-line comments before code', () => {
    function test() {
      // this is a comment
      const x = 1;
      return x;
    }

    expect(stringifyFn(test)).toBe('function() {  const x = 1; return x; }');
  });

  test('removes single-line comments after code', () => {
    function test() {
      const x = 1; // comment after code
      return x;
    }

    expect(stringifyFn(test)).toBe('function() { const x = 1;  return x; }');
  });

  test('removes multi-line comment /* ... */', () => {
    function test() {
      /* this is a block
         comment */
      const x = 1;
      return x;
    }

    expect(stringifyFn(test)).toBe('function() {  const x = 1; return x; }');
  });

  test('removes JSDoc-style comment /** ... */', () => {
    function test() {
      /**
       * This is a JSDoc comment
       * @returns {number}
       */
      const x = 1;
      return x;
    }

    expect(stringifyFn(test)).toBe('function() {  const x = 1; return x; }');
  });

  test('removes multiple comment types in one function', () => {
    function test(a) {
      // comment
      const b = a + 1; /* inline block */
      /**
       * multiline again
       */
      return b; // done
    }

    expect(stringifyFn(test)).toBe('function(a) {  const b = a + 1;   return b;  }');
  });

  test('preserves code inside strings and template literals', () => {
    function test() {
      const str = 'this is not // a comment';
      const tpl = `also not /* a comment */`;
      return str + tpl;
    }

    expect(stringifyFn(test)).toBe(
      "function() { const str = 'this is not // a comment'; const tpl = `also not /* a comment */`; return str + tpl; }"
    );
  });
});

describe('escapeSequences', () => {
  test('escapeSequences', () => {
    const html = `
<img
  src="img.png"
>
`;
    const received = escapeSequences(html);
    const expected = `\\n<img\\n  src=\"img.png\"\\n>\\n`;
    return expect(received).toEqual(expected);
  });
});

describe('escapeCodesForJSON', () => {
  test('escapeCodesForJSON', () => {
    const html = '<div data-json="{key: `text\\ntext`}">';
    const received = escapeCodesForJSON(html);
    const expected = '<div data-json="{key: \\`text\\\\ntext\\`}">';
    return expect(received).toEqual(expected);
  });
});

describe('injectBeforeEndHead', () => {
  test('injectBeforeEndHead', () => {
    const html = `<html><head><title>test</title></head><body><p>body</p></body></html>`;
    const received = injectBeforeEndHead(html, `<script src="test.js"></script>`);
    const expected = `<html><head><title>test</title><script src="test.js"></script></head><body><p>body</p></body></html>`;
    return expect(received).toEqual(expected);
  });

  test('injectBeforeEndHead without head', () => {
    const html = `<html><body><p>body</p></body></html>`;
    const received = injectBeforeEndHead(html, `<script src="test.js"></script>`);
    const expected = `<html><body><p>body</p><script src="test.js"></script></body></html>`;
    return expect(received).toEqual(expected);
  });
});

describe('injectBeforeEndBody', () => {
  test('injectBeforeEndBody', () => {
    const html = `<html><head><title>test</title></head><body><p>body</p></body></html>`;
    const received = injectBeforeEndBody(html, `<script src="test.js"></script>`);
    const expected = `<html><head><title>test</title></head><body><p>body</p><script src="test.js"></script></body></html>`;
    return expect(received).toEqual(expected);
  });

  test('injectBeforeEndBody without body', () => {
    const html = `<html><head><title>test</title></head><p>body</p></html>`;
    const received = injectBeforeEndBody(html, `<script src="test.js"></script>`);
    const expected = `<html><head><title>test</title></head><p>body</p><script src="test.js"></script></html>`;
    return expect(received).toEqual(expected);
  });

  test('injectBeforeEndBody without html', () => {
    const html = `<p>body</p>`;
    const received = injectBeforeEndBody(html, `<script src="test.js"></script>`);
    const expected = `<p>body</p><script src="test.js"></script>`;
    return expect(received).toEqual(expected);
  });
});
