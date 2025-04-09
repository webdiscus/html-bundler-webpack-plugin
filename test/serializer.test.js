const { serialize, deserialize } = require('../../src/Common/FileSystem/ModuleLoader/serializer');

describe('serialize/deserialize', () => {
  test('Date', () => {
    const obj = { date: new Date() };
    const copy = deserialize(serialize(obj));
    expect(copy.date).toEqual(obj.date);
    expect(copy.date instanceof Date).toBe(true);
  });

  test('RegExp', () => {
    const obj = { regex: /abc\d+/gi };
    const copy = deserialize(serialize(obj));
    expect(copy.regex).toEqual(obj.regex);
    expect(copy.regex instanceof RegExp).toBe(true);
  });

  test('BigInt', () => {
    const obj = { big: BigInt('12345678901234567890') };
    const copy = deserialize(serialize(obj));
    expect(copy.big).toBe(obj.big);
    expect(typeof copy.big).toBe('bigint');
  });

  test('Symbol', () => {
    const obj = { sym: Symbol('my-symbol') };
    const copy = deserialize(serialize(obj));
    expect(typeof copy.sym).toBe('symbol');
    expect(copy.sym.toString()).toBe(obj.sym.toString());
  });

  test('Buffer', () => {
    const obj = { buffer: Buffer.from('hello') };
    const copy = deserialize(serialize(obj));
    expect(copy.buffer.equals(obj.buffer)).toBe(true);
    expect(Buffer.isBuffer(copy.buffer)).toBe(true);
  });

  test('Map', () => {
    const map = new Map([
      ['a', 1],
      ['b', { c: 2 }],
    ]);
    const obj = { map };
    const copy = deserialize(serialize(obj));
    expect(copy.map instanceof Map).toBe(true);
    expect(copy.map.get('b').c).toBe(2);
  });

  test('Set', () => {
    const value = { y: 2 };
    const set = new Set(['x', 1, value]);
    const obj = { set };
    const copy = deserialize(serialize(obj));

    expect(copy.set instanceof Set).toBe(true);

    const arr = Array.from(copy.set);
    expect(arr).toContain('x');
    expect(arr).toContain(1);

    const hasObject = arr.some((v) => typeof v === 'object' && v.y === 2);
    expect(hasObject).toBe(true);
  });

  test('Function', () => {
    const obj = {
      fn: function (x) {
        return x + 1;
      },
    };
    const copy = deserialize(serialize(obj));
    expect(typeof copy.fn).toBe('function');
    expect(copy.fn(2)).toBe(3);
  });

  test('URL', () => {
    const obj = { url: new URL('https://example.com/path?x=1') };
    const copy = deserialize(serialize(obj));
    expect(copy.url instanceof URL).toBe(true);
    expect(copy.url.href).toBe(obj.url.href);
  });

  test('ArrayBuffer', () => {
    const buffer = new ArrayBuffer(8);
    const view = new Uint8Array(buffer);
    view.set([1, 2, 3, 4]);
    const obj = { buffer };
    const copy = deserialize(serialize(obj));
    expect(copy.buffer instanceof ArrayBuffer).toBe(true);
    expect(new Uint8Array(copy.buffer)).toEqual(view);
  });

  test('TypedArray - Uint8Array', () => {
    const arr = new Uint8Array([10, 20, 30]);
    const obj = { arr };
    const copy = deserialize(serialize(obj));
    expect(copy.arr instanceof Uint8Array).toBe(true);
    expect(copy.arr).toEqual(arr);
  });

  test('TypedArray - Float64Array', () => {
    const arr = new Float64Array([1.1, 2.2]);
    const obj = { arr };
    const copy = deserialize(serialize(obj));
    expect(copy.arr instanceof Float64Array).toBe(true);
    expect(copy.arr).toEqual(arr);
  });

  test('Error and subclasses', () => {
    const obj = {
      error: new TypeError('Boom!'),
    };
    const copy = deserialize(serialize(obj));
    expect(copy.error).toBeInstanceOf(Error);
    expect(copy.error.message).toBe('Boom!');
    expect(copy.error.name).toBe('TypeError');
    expect(copy.error.stack).toContain('Boom');
  });

  test('Circular reference', () => {
    const obj = { a: 1 };
    obj.self = obj;
    const copy = deserialize(serialize(obj));
    expect(copy.self).toBe(copy);
  });

  // TODO: fix instance of a class
  // test('Class instance with registry', () => {
  //   class MyClass {
  //     constructor(x) {
  //       this.x = x;
  //     }
  //   }
  //
  //   const obj = { inst: new MyClass(42) };
  //   const json = serialize(obj);
  //   const copy = deserialize(json);
  //
  //   console.log({
  //     serialized: json,
  //     deserialized: copy,
  //     expected: obj,
  //   });
  //
  //   expect(copy.inst instanceof MyClass).toBe(true); // Check if instance is restored
  //   expect(copy.inst.x).toBe(42); // Check if the data is correct
  // });
});
