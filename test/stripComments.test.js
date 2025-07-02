const { stripComments } = require('../src/Loader/Utils');

describe('strip comments', () => {
  test('preserves empty string', () => {
    expect(stripComments('')).toBe('');
  });

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

  test('removes comments after strings with escaped quotes', () => {
    expect(stripComments('const s = "a \\" // not comment"; // actual comment')).toBe(
      'const s = "a \\" // not comment"; '
    );
  });

  test('removes everything after //', () => {
    expect(stripComments('a = 1; // c1 /* c2 */ b = 2; // c3')).toBe('a = 1; ');
  });

  test('removes multiline block comments', () => {
    expect(stripComments('a = 1; /* comment\nstill comment\nend*/ b = 2;')).toBe('a = 1;  b = 2;');
  });

  test('removes only comments, not code that looks like comments', () => {
    expect(stripComments('const x = "//"; /* real */')).toBe('const x = "//"; ');
    expect(stripComments("const y = '/* not a comment */'; // real")).toBe("const y = '/* not a comment */'; ");
  });

  test('removes block comments with stars inside', () => {
    expect(stripComments('/* ***\ncomment\n***/const x=2;')).toBe('const x=2;');
  });

  test('removes comments at end of input', () => {
    expect(stripComments('const x=1;// comment')).toBe('const x=1;');
    expect(stripComments('const x=1;/* comment */')).toBe('const x=1;');
  });

  test('preserves newlines for removed comments', () => {
    expect(stripComments('let a=1; // foo\nlet b=2;')).toBe('let a=1; \nlet b=2;');
    expect(stripComments('let a=1; /* foo */\nlet b=2;')).toBe('let a=1; \nlet b=2;');
  });

  test('removes comments after strings with multiple escaped backslashes', () => {
    expect(stripComments('const s = "\\\\\\"/*"; // comment')).toBe('const s = "\\\\\\"/*"; ');
  });

  test('preserves code without comments', () => {
    expect(stripComments('let a = 42;')).toBe('let a = 42;');
  });

  test('removes all comments from code containing only comments', () => {
    expect(stripComments('// only comment')).toBe('');
    expect(stripComments('/* only block comment */')).toBe('');
    expect(stripComments('// one\n/* two */')).toBe('\n');
  });

  test('preserves comment-like sequences in strings', () => {
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

  test('removes line comments after division, does not break on division operator', () => {
    const input = `
let a = b / c / d; // division
let a = foo() / 42; // division
let a = a++ / 2; // division
`;
    const expected = `
let a = b / c / d; 
let a = foo() / 42; 
let a = a++ / 2; 
`;
    expect(stripComments(input)).toBe(expected);
  });
});

describe('removes comments in code contains RegExp', () => {
  test('removes comment after basic RegExp', () => {
    expect(stripComments('const r = /abc/; // end comment')).toBe('const r = /abc/; ');
  });

  test('removes comment after RegExp with flags', () => {
    expect(stripComments('let r = /test/i; // case-insensitive')).toBe('let r = /test/i; ');
  });

  test('removes comment after RegExp with escaped slash', () => {
    expect(stripComments('let r = /\\/\\//; // matches //')).toBe('let r = /\\/\\//; ');
  });

  test('removes comment after RegExp with slash in character class', () => {
    expect(stripComments('let r = /a[\\/]/; // slash in class')).toBe('let r = /a[\\/]/; ');
  });

  test('removes comment after RegExp in function', () => {
    expect(stripComments('function t(x) { return /foo/.test(x); } // test')).toBe(
      'function t(x) { return /foo/.test(x); } '
    );
  });

  test('removes comment after RegExp with line comment-like in pattern', () => {
    expect(stripComments('let r = /a\\/\\/b/; // not a comment')).toBe('let r = /a\\/\\/b/; ');
  });

  test('removes block comment after RegExp with block comment-like in pattern', () => {
    expect(stripComments('let r = /a\\/\\*b/; /* block */')).toBe('let r = /a\\/\\*b/; ');
  });

  test('removes comment after RegExp after assignment', () => {
    expect(stripComments('let r = 1; r = /test/; // test regex')).toBe('let r = 1; r = /test/; ');
  });

  test('removes comment after RegExp at start of file', () => {
    expect(stripComments('/foo/.test("foo"); // start')).toBe('/foo/.test("foo"); ');
  });

  test('removes comment after RegExp as argument', () => {
    expect(stripComments('call(/abc/); // call with regex')).toBe('call(/abc/); ');
  });

  test('removes comment after division following RegExp', () => {
    expect(stripComments('let a = /x/.source.length / 2; // division')).toBe('let a = /x/.source.length / 2; ');
  });

  test('removes comment after RegExp with comment-like content in class', () => {
    expect(stripComments('let r = /[\\/\\*\\n]/; // class')).toBe('let r = /[\\/\\*\\n]/; ');
  });

  test('removes comment after multiple RegExp in one line', () => {
    expect(stripComments('let a = /foo/; let b = /bar/; // comment')).toBe('let a = /foo/; let b = /bar/; ');
  });

  test('removes comment after RegExp following return', () => {
    expect(stripComments('return /abc/; // regex')).toBe('return /abc/; ');
  });
});

describe('preserves RegExp', () => {
  test('preserves RegExp with double slashes', () => {
    const code = `const re = /\\/\\/.*$/; // regex`;
    expect(stripComments(code)).toBe(`const re = /\\/\\/.*$/; `);
  });

  test('preserves RegExp with double slashes inside', () => {
    expect(stripComments('const re = /https?:\\/\\/example\\.com/; // trailing comment')).toBe(
      'const re = /https?:\\/\\/example\\.com/; '
    );
  });

  test('does not break on block comment inside RegExp character class', () => {
    expect(stripComments('const re = /[/*]/; // comment')).toBe('const re = /[/*]/; ');
  });

  test('does not treat RegExp with /* */ as comment', () => {
    expect(stripComments('const r = /a*/*test/; // trailing')).toBe('const r = /a*/*test/; ');
  });

  // test of real code from a hbs helper
  test('removes all comments from complex code containing RegExp literals and functions', () => {
    const input = `
  let out = '';

  // comment
  const escapeHTML = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const SEP = /(\\s|&nbsp;|<br\\s*\\/?>)+/gi;
  const parts = content.split(SEP).filter(Boolean);
  const lastWord = parts.pop() || '';
  const firstPart = parts.join(''); // magic comment

  if (!firstPart.trim()) {
    out = \`<p class="title">\${escapeHTML(lastWord)}</p>\`;
  } else {
    out =
      \`<p class="title">\` +
      \`\${firstPart}\` +
      \`<span class="inline-flex">\` +
      \`\${escapeHTML(lastWord)}\` +
      \`</span>\` +
      \`</p>\`;
  }

  return new Handlebars.SafeString(out);
  `;

    const expected = `
  let out = '';

  
  const escapeHTML = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const SEP = /(\\s|&nbsp;|<br\\s*\\/?>)+/gi;
  const parts = content.split(SEP).filter(Boolean);
  const lastWord = parts.pop() || '';
  const firstPart = parts.join(''); 

  if (!firstPart.trim()) {
    out = \`<p class="title">\${escapeHTML(lastWord)}</p>\`;
  } else {
    out =
      \`<p class="title">\` +
      \`\${firstPart}\` +
      \`<span class="inline-flex">\` +
      \`\${escapeHTML(lastWord)}\` +
      \`</span>\` +
      \`</p>\`;
  }

  return new Handlebars.SafeString(out);
  `;

    expect(stripComments(input)).toBe(expected);
  });
});
