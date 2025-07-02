const { stripComments } = require('../src/Loader/Utils');

describe('stripComments', () => {
  test('removes single-line comments', () => {
    expect(stripComments('const x = 1; // a comment')).toBe('const x = 1; ');
  });

  test('removes multi-line (block) comments', () => {
    expect(stripComments('let y = 2; /* block comment */ y++;')).toBe('let y = 2;  y++;');
  });

  test('preserves comment-like patterns inside single quotes', () => {
    expect(stripComments("const s = 'foo // bar'; // real comment")).toBe("const s = 'foo // bar'; ");
  });

  test('preserves comment-like patterns inside double quotes', () => {
    expect(stripComments('const s = "// not a comment"; // real comment')).toBe('const s = "// not a comment"; ');
  });

  test('preserves comment-like patterns inside template strings', () => {
    expect(stripComments('const s = `/* not a comment */`; // real comment')).toBe('const s = `/* not a comment */`; ');
  });

  test('handles strings with escaped quotes', () => {
    expect(stripComments('const s = "a \\" // not comment"; // actual comment')).toBe(
      'const s = "a \\" // not comment"; '
    );
  });

  test('line comment disables block comments and code after //', () => {
    expect(stripComments('a = 1; // c1 /* c2 */ b = 2; // c3')).toBe('a = 1; ');
  });

  test('removes multiline block comments', () => {
    expect(stripComments('a = 1; /* comment\nstill comment\nend*/ b = 2;')).toBe('a = 1;  b = 2;');
  });

  test('removes only comments, not code that looks like comments', () => {
    expect(stripComments('const x = "//"; /* real */')).toBe('const x = "//"; ');
    expect(stripComments("const y = '/* not a comment */'; // real")).toBe("const y = '/* not a comment */'; ");
  });

  test('handles block comments with stars inside', () => {
    expect(stripComments('/* ***\ncomment\n***/const x=2;')).toBe('const x=2;');
  });

  test('handles comments at end of input', () => {
    expect(stripComments('const x=1;// comment')).toBe('const x=1;');
    expect(stripComments('const x=1;/* comment */')).toBe('const x=1;');
  });

  test('preserves newlines for removed comments', () => {
    expect(stripComments('let a=1; // foo\nlet b=2;')).toBe('let a=1; \nlet b=2;');
    expect(stripComments('let a=1; /* foo */\nlet b=2;')).toBe('let a=1; \nlet b=2;');
  });

  test('handles nested strings with escaped escapes', () => {
    expect(stripComments('const s = "\\\\\\"/*"; // comment')).toBe('const s = "\\\\\\"/*"; ');
  });

  test('handles no comments', () => {
    expect(stripComments('let a = 42;')).toBe('let a = 42;');
  });

  test('handles code with only comments', () => {
    expect(stripComments('// only comment')).toBe('');
    expect(stripComments('/* only block comment */')).toBe('');
    expect(stripComments('// one\n/* two */')).toBe('\n');
  });

  test('handles empty string', () => {
    expect(stripComments('')).toBe('');
  });

  test('handles sequence of slashes and stars not being comments', () => {
    expect(stripComments('const s = "/**/"; // real')).toBe('const s = "/**/"; ');
    expect(stripComments("const s = '//'; /* real */")).toBe("const s = '//'; ");
  });

  test('removes multiple block and line comments together', () => {
    const code = `
      // line 1
      let a = 1; /* block 1 */
      let b = 2; // line 2
      /* block 2 */
      let c = 3;
`;
    const expected = `
      
      let a = 1; 
      let b = 2; 
      
      let c = 3;
`;
    expect(stripComments(code)).toBe(expected);
  });

  test('correctly preserves regex with double slashes', () => {
    const code = `const re = /\\/\\/.*$/; // regex`;
    expect(stripComments(code)).toBe(`const re = /\\/\\/.*$/; `);
  });

  test('preserves RegExp with double slashes inside', () => {
    expect(stripComments('const re = /https?:\\/\\/example\\.com/; // trailing comment'))
      .toBe('const re = /https?:\\/\\/example\\.com/; ');
  });

  test('does not break on block comment inside RegExp character class', () => {
    expect(stripComments('const re = /[/*]/; // comment'))
      .toBe('const re = /[/*]/; ');
  });

  test('does not treat RegExp with /* */ as comment', () => {
    expect(stripComments('const r = /a*/*test/; // trailing'))
      .toBe('const r = /a*/*test/; ');
  });
});
