const { parseRequest, parseJSON5Query } = require('../src/Common/RequestParser');

describe('parseRequest tests', () => {
  test('empty key', () => {
    const received = parseRequest('image.jpg?&key2=val2').query;
    const expected = {
      key2: 'val2',
    };
    return expect(received).toStrictEqual(expected);
  });

  test('key w/o value should be true', () => {
    const received = parseRequest('image.jpg?disable').query;
    const expected = {
      disable: true,
    };
    return expect(received).toStrictEqual(expected);
  });

  test('key is true', () => {
    const received = parseRequest('image.jpg?disable=true').query;
    const expected = {
      disable: true,
    };
    return expect(received).toStrictEqual(expected);
  });

  test('key is false', () => {
    const received = parseRequest('image.jpg?disable=false').query;
    const expected = {
      disable: false,
    };
    return expect(received).toStrictEqual(expected);
  });

  test('array', () => {
    const received = parseRequest('file.html?key=val&arr[]=a&arr[]=1&disable').query;
    const expected = {
      key: 'val',
      arr: ['a', '1'],
      disable: true,
    };
    return expect(received).toStrictEqual(expected);
  });

  test('comma', () => {
    const received = parseRequest('image.jpg?size=500,placeholder').query;
    const expected = {
      size: '500',
      placeholder: true,
    };
    return expect(received).toStrictEqual(expected);
  });

  test('array sizes', () => {
    const received = parseRequest('image.jpg?sizes[]=300,sizes[]=600,sizes[]=800&format=webp').query;
    const expected = {
      format: 'webp',
      sizes: ['300', '600', '800'],
    };
    return expect(received).toStrictEqual(expected);
  });

  test('values with special chars', () => {
    const received = parseRequest(
      'image.jpg?name=[path][hash:8]-[width]x[height].[ext]&background=%23FF0000&context=./'
    ).query;
    const expected = {
      name: '[path][hash:8]-[width]x[height].[ext]',
      background: '#FF0000',
      context: './',
    };
    return expect(received).toStrictEqual(expected);
  });

  test('json5 notation', () => {
    const received = parseRequest(
      `image.jpg?{sizes:[50,100,200,300], cacheDirectory:'src/cache/', format: "webp"}`
    ).query;
    const expected = {
      sizes: [50, 100, 200, 300],
      cacheDirectory: 'src/cache/',
      format: 'webp',
    };
    return expect(received).toStrictEqual(expected);
  });

  test('json5 flat', () => {
    const received = parseRequest(
      `image.jpg?{placeholder:true, sizes:[10,20,30],background:'%23FF0000',  format: "webp"}`
    ).query;
    const expected = {
      placeholder: true,
      sizes: [10, 20, 30],
      background: '#FF0000',
      format: 'webp',
    };
    return expect(received).toStrictEqual(expected);
  });
});

describe('parseJSON5Query objects', () => {
  test('empty object', () => {
    const received = parseJSON5Query(`{}`);
    const expected = {};
    return expect(received).toStrictEqual(expected);
  });

  test('whitespace', () => {
    const received = parseJSON5Query(`{a:1, b: 2 }`);
    const expected = { a: 1, b: 2 };
    return expect(received).toStrictEqual(expected);
  });

  test('double quoted property names', () => {
    const received = parseJSON5Query(`{"a":1}`);
    const expected = { a: 1 };
    return expect(received).toStrictEqual(expected);
  });

  test('single quoted property names', () => {
    const received = parseJSON5Query(`{'a':1}`);
    const expected = { a: 1 };
    return expect(received).toStrictEqual(expected);
  });

  test('unquoted property names', () => {
    const received = parseJSON5Query(`{a:1}`);
    const expected = { a: 1 };
    return expect(received).toStrictEqual(expected);
  });

  test('special character property names', () => {
    const received = parseJSON5Query(`{$_:1,_$:2}`);
    const expected = { $_: 1, _$: 2 };
    return expect(received).toStrictEqual(expected);
  });

  test('property names', () => {
    const received = parseJSON5Query(`{"__key__":1}`).__key__;
    const expected = 1;
    return expect(received).toStrictEqual(expected);
  });

  test('parses multiple properties', () => {
    const received = parseJSON5Query(`{key1:1,key2:2}`);
    const expected = { key1: 1, key2: 2 };
    return expect(received).toStrictEqual(expected);
  });

  test('nested objects', () => {
    const received = parseJSON5Query(`{a:{b:2}}`);
    const expected = { a: { b: 2 } };
    return expect(received).toStrictEqual(expected);
  });
});

describe('parseJSON5Query arrays', () => {
  test('empty array', () => {
    const received = parseJSON5Query(`[]`);
    const expected = [];
    return expect(received).toStrictEqual(expected);
  });

  test('array value', () => {
    const received = parseJSON5Query(`[1]`);
    const expected = [1];
    return expect(received).toStrictEqual(expected);
  });

  test('multiple array values', () => {
    const received = parseJSON5Query(`[1,2]`);
    const expected = [1, 2];
    return expect(received).toStrictEqual(expected);
  });

  test('nested arrays', () => {
    const received = parseJSON5Query(`[1,[2,3]]`);
    const expected = [1, [2, 3]];
    return expect(received).toStrictEqual(expected);
  });
});

describe('parseJSON5Query strings', () => {
  test('double quoted strings', () => {
    const received = parseJSON5Query(`["abc"]`);
    const expected = ['abc'];
    return expect(received).toStrictEqual(expected);
  });

  test('single quoted strings', () => {
    const received = parseJSON5Query(`['abc']`);
    const expected = ['abc'];
    return expect(received).toStrictEqual(expected);
  });

  test('quotes in strings', () => {
    const received = parseJSON5Query(`['"',"'"]`);
    const expected = ['"', "'"];
    return expect(received).toStrictEqual(expected);
  });
});

describe('parseJSON5Query comments', () => {
  test('single-line comments', () => {
    const received = parseJSON5Query(`{/* comment a:1 */a:1}`);
    const expected = { a: 1 };
    return expect(received).toStrictEqual(expected);
  });

  test('multiline-line comments', () => {
    const received = parseJSON5Query(`{/** comment a:1 */a:1}`);
    const expected = { a: 1 };
    return expect(received).toStrictEqual(expected);
  });

  test('double asterisk multiline-line comments', () => {
    const received = parseJSON5Query(`{/** comment a:1 **/a:1}`);
    const expected = { a: 1 };
    return expect(received).toStrictEqual(expected);
  });
});

describe('parseJSON5Query values', () => {
  test('null', () => {
    const received = parseJSON5Query(`null`);
    const expected = null;
    return expect(received).toStrictEqual(expected);
  });

  test('true', () => {
    const received = parseJSON5Query(`true`);
    const expected = true;
    return expect(received).toStrictEqual(expected);
  });

  test('false', () => {
    const received = parseJSON5Query(`false`);
    const expected = false;
    return expect(received).toStrictEqual(expected);
  });

  test('leading zeroes', () => {
    const received = parseJSON5Query(`[0,0.,0e0]`);
    const expected = [0, 0, 0];
    return expect(received).toStrictEqual(expected);
  });

  test('integers', () => {
    const received = parseJSON5Query(`[1,23,456,7890]`);
    const expected = [1, 23, 456, 7890];
    return expect(received).toStrictEqual(expected);
  });

  test('signed numbers', () => {
    const received = parseJSON5Query(`[-1,+2,-.1,-0]`);
    const expected = [-1, +2, -0.1, -0];
    return expect(received).toStrictEqual(expected);
  });

  test('floats', () => {
    const received = parseJSON5Query(`[1.0,1.23]`);
    const expected = [1, 1.23];
    return expect(received).toStrictEqual(expected);
  });

  test('leading decimal points', () => {
    const received = parseJSON5Query(`[.1,.23]`);
    const expected = [0.1, 0.23];
    return expect(received).toStrictEqual(expected);
  });

  test('exponents', () => {
    const received = parseJSON5Query(`[1e0,1e1,1e01,1.e0,1.1e0,1e-1,1e+1]`);
    const expected = [1, 10, 10, 1, 1.1, 0.1, 10];
    return expect(received).toStrictEqual(expected);
  });

  test('numbers +1.23e100, 0x1', () => {
    const received = parseJSON5Query(`[+1.23e100,0x1]`);
    const expected = [1.23e100, 0x1];
    return expect(received).toStrictEqual(expected);
  });

  test('hexadecimal numbers', () => {
    const received = parseJSON5Query(`[0x1,0x10,0xff,0xFF]`);
    const expected = [1, 16, 255, 255];
    return expect(received).toStrictEqual(expected);
  });

  test('long hexadecimal number', () => {
    const received = parseJSON5Query(`[-0x0123456789abcdefABCDEF]`);
    const expected = [-0x0123456789abcdefabcdef];
    return expect(received).toStrictEqual(expected);
  });

  test('signed and unsigned Infinity', () => {
    const received = parseJSON5Query(`[Infinity,-Infinity]`);
    const expected = [Infinity, -Infinity];
    return expect(received).toStrictEqual(expected);
  });

  test('signed and unsigned NaN', () => {
    const received = parseJSON5Query(`[NaN,-NaN]`);
    const expected = [NaN, -NaN];
    return expect(received).toStrictEqual(expected);
  });
});

describe('parseJSON5Query errors', () => {
  test('empty document', () => {
    const expected = `invalid end of input`;
    expect(() => {
      parseJSON5Query(``);
    }).toThrow(expected);
  });

  test('unterminated multiline comments', () => {
    const expected = `invalid end of input`;
    expect(() => {
      parseJSON5Query(`/*`);
    }).toThrow(expected);
  });

  test('unterminated multiline comment closings', () => {
    const expected = `invalid end of input`;
    expect(() => {
      parseJSON5Query(`/**`);
    }).toThrow(expected);
  });

  test('incomplete single line comments', () => {
    const expected = `invalid character 'a' at position 3`;
    expect(() => {
      parseJSON5Query(`{/a}`);
    }).toThrow(expected);
  });

  test('multiple values', () => {
    const expected = `invalid character '2' at position 3`;
    expect(() => {
      //parseJSON5Query(`1]`); // the same case
      parseJSON5Query(`1 2`);
    }).toThrow(expected);
  });

  test('unclosed objects before property names', () => {
    const expected = `invalid end of input`;
    expect(() => {
      parseJSON5Query(`{`);
    }).toThrow(expected);
  });

  test('unclosed objects after property names', () => {
    const expected = `invalid end of input at position 3`;
    expect(() => {
      parseJSON5Query(`{a`);
    }).toThrow(expected);
  });

  test('unclosed objects before property values', () => {
    const expected = `invalid end of input at position 4`;
    expect(() => {
      parseJSON5Query(`{a:`);
    }).toThrow(expected);
  });

  test('unclosed objects after property values', () => {
    const expected = `invalid end of input at position 5`;
    expect(() => {
      parseJSON5Query(`{a:1`);
    }).toThrow(expected);
  });

  test('invalid identifier start characters in property names', () => {
    const expected = `invalid character '!'`;
    expect(() => {
      parseJSON5Query(`{!:1}`);
    }).toThrow(expected);
  });

  test('object items w/o value', () => {
    const expected = `invalid character '}' at position 3`;
    expect(() => {
      parseJSON5Query(`{a}`);
    }).toThrow(expected);
  });

  test('invalid characters following a property name', () => {
    const expected = `invalid character '!'`;
    expect(() => {
      parseJSON5Query(`{a!1}`);
    }).toThrow(expected);
  });

  test('invalid characters following a property name, 2', () => {
    const expected = `invalid character '\\"' at position 3`;
    expect(() => {
      parseJSON5Query(`{a"`);
    }).toThrow(expected);
  });

  test('invalid characters following a property value', () => {
    const expected = `invalid character '!'`;
    expect(() => {
      parseJSON5Query(`{a:1!}`);
    }).toThrow(expected);
  });

  test('unclosed arrays before values', () => {
    const expected = `invalid end of input at position 2`;
    expect(() => {
      parseJSON5Query(`[`);
    }).toThrow(expected);
  });

  test('unclosed arrays after values', () => {
    const expected = `invalid end of input at position 3`;
    expect(() => {
      parseJSON5Query(`[1`);
    }).toThrow(expected);
  });

  test('unterminated strings', () => {
    const expected = `invalid end of input at position 7`;
    expect(() => {
      parseJSON5Query(`["abc]`);
    }).toThrow(expected);
  });

  test('invalid characters in json5 value', () => {
    const expected = `invalid character 'a' at position 1`;
    expect(() => {
      parseJSON5Query(`a`);
    }).toThrow(expected);
  });

  test('invalid characters following an array value', () => {
    const expected = `invalid character '!' at position 3`;
    expect(() => {
      parseJSON5Query(`[1!]`);
    }).toThrow(expected);
  });

  test('invalid characters in literals', () => {
    const expected = `invalid character '!' at position 5`;
    expect(() => {
      parseJSON5Query(`[tru!]`);
    }).toThrow(expected);
  });

  test('invalid characters following a sign', () => {
    const expected = `invalid character 'a' at position 3`;
    expect(() => {
      parseJSON5Query(`[-a]`);
    }).toThrow(expected);
  });

  test('invalid characters following a leading decimal point', () => {
    const expected = `invalid character 'a' at position 3`;
    expect(() => {
      parseJSON5Query(`[.a]`);
    }).toThrow(expected);
  });

  test('invalid characters following a hexadecimal prefix', () => {
    const expected = `invalid character 'g' at position 4`;
    expect(() => {
      parseJSON5Query(`[0xg]`);
    }).toThrow(expected);
  });

  test('invalid characters following an exponent indicator', () => {
    const expected = `invalid character 'a' at position 4`;
    expect(() => {
      parseJSON5Query(`[1ea]`);
    }).toThrow(expected);
  });

  test('invalid characters following an exponent sign', () => {
    const expected = `invalid character 'a' at position 5`;
    expect(() => {
      parseJSON5Query(`[1e-a]`);
    }).toThrow(expected);
  });
});
