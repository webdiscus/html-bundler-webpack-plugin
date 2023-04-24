import fs from 'fs';
import { parseQuery, getFileExtension } from '../src/Common/Helpers';
import { loadModule, resolveFile } from '../src/Common/FileUtils';
import AssetEntry from '../src/Plugin/AssetEntry';
import Template from '../src/Loader/Template';
import { injectBeforeEndHead, injectBeforeEndBody } from '../src/Loader/Utils';
import Options from '../src/Plugin/Options';

describe('parseQuery tests', () => {
  test('parseQuery key w/o value should be true', () => {
    const received = parseQuery('image.jpg?disable');
    const expected = {
      disable: true,
    };
    return expect(received).toStrictEqual(expected);
  });

  test('parseQuery key is true', () => {
    const received = parseQuery('image.jpg?disable=true');
    const expected = {
      disable: true,
    };
    return expect(received).toStrictEqual(expected);
  });

  test('parseQuery key is false', () => {
    const received = parseQuery('image.jpg?disable=false');
    const expected = {
      disable: false,
    };
    //return expect(received).toEqual(expected);
    return expect(received).toStrictEqual(expected);
  });

  test('parseQuery array', () => {
    const received = parseQuery('file.html?key=val&arr[]=a&arr[]=1&disable');
    const expected = {
      key: 'val',
      arr: ['a', '1'],
      disable: true,
    };
    return expect(received).toStrictEqual(expected);
  });

  test('parseQuery comma', () => {
    const received = parseQuery('image.jpg?size=500,placeholder');
    const expected = {
      size: '500',
      placeholder: true,
    };
    return expect(received).toStrictEqual(expected);
  });

  test('parseQuery array sizes', () => {
    const received = parseQuery('image.jpg?sizes[]=300,sizes[]=600,sizes[]=800&format=webp');
    const expected = {
      format: 'webp',
      sizes: ['300', '600', '800'],
    };
    return expect(received).toStrictEqual(expected);
  });

  test('parseQuery values with special chars', () => {
    const received = parseQuery('image.jpg?name=[path][hash:8]-[width]x[height].[ext]&background=%23FF0000&context=./');
    const expected = {
      name: '[path][hash:8]-[width]x[height].[ext]',
      background: '#FF0000',
      context: './',
    };
    return expect(received).toStrictEqual(expected);
  });

  test('parseQuery json5 flat', () => {
    const received = parseQuery(
      `image.jpg?{placeholder:true, sizes:[10,20,30],background:'%23FF0000',  format: "webp"}`
    );
    const expected = {
      placeholder: true,
      sizes: [10, 20, 30],
      background: '#FF0000',
      format: 'webp',
    };
    return expect(received).toStrictEqual(expected);
  });

  test('parseQuery json5 level2', () => {
    const received = parseQuery(
      `image.jpg?{placeholder:true, sizes:[10,20,30],background:'%23FF0000', obj: {a:123, b: [1,'x',2], c: 'abc'}, format: "webp"}`
    );
    const expected = {
      placeholder: true,
      sizes: [10, 20, 30],
      background: '#FF0000',
      obj: { a: 123, b: [1, 'x', 2], c: 'abc' },
      format: 'webp',
    };
    return expect(received).toStrictEqual(expected);
  });
});

describe('file extension', () => {
  test('file.ext', () => {
    const received = getFileExtension('file.ext');
    const expected = 'ext';
    return expect(received).toEqual(expected);
  });

  test('file.ext?query', () => {
    const received = getFileExtension('file.ext?query');
    const expected = 'ext';
    return expect(received).toEqual(expected);
  });

  test('file', () => {
    const received = getFileExtension('file');
    const expected = '';
    return expect(received).toEqual(expected);
  });

  test('file?query', () => {
    const received = getFileExtension('file?query');
    const expected = '';
    return expect(received).toEqual(expected);
  });

  test('path.sample/file', () => {
    const received = getFileExtension('path.sample/file');
    const expected = '';
    return expect(received).toEqual(expected);
  });

  test('path.sample/file?query', () => {
    const received = getFileExtension('path.sample/file?query');
    const expected = '';
    return expect(received).toEqual(expected);
  });

  test('path.sample\\file', () => {
    const received = getFileExtension('path.sample\\file', true);
    const expected = '';
    return expect(received).toEqual(expected);
  });

  test('path.sample\\file.ext?query', () => {
    const received = getFileExtension('path.sample\\file.ext?query', true);
    const expected = 'ext';
    return expect(received).toEqual(expected);
  });
});

describe('utils unit tests', () => {
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

describe('parse attributes unit tests', () => {
  test('parseAttr without attr', () => {
    const source = '<img alt="apple">';
    const received = Template.parseAttr(source, 'src');
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('parseAttr empty value', () => {
    const source = '<img src="">';
    const received = Template.parseAttr(source, 'src');
    const expected = {
      attr: 'src',
      startPos: 10,
      endPos: 10,
      value: '',
    };
    return expect(received).toEqual(expected);
  });

  test('parseAttr value', () => {
    const source = '<img src="img1.png" srcset="img1.png, img2.png 100w, img3.png 1.5x">';
    const received = Template.parseAttr(source, 'src');
    const expected = {
      attr: 'src',
      startPos: 10,
      endPos: 18,
      value: 'img1.png',
    };
    return expect(received).toEqual(expected);
  });

  test('parseSrcset single value', () => {
    const source = '<source srcset="img1.png">';
    const received = Template.parseAttr(source, 'srcset');
    const expected = {
      attr: 'srcset',
      startPos: 16,
      endPos: 24,
      value: [
        {
          startPos: 0,
          endPos: 8,
          value: 'img1.png',
        },
      ],
    };
    return expect(received).toEqual(expected);
  });

  test('parseSrcset multi values', () => {
    const source = '<img src="img1.png" srcset="img1.png, img2.png 100w, img3.png 1.5x">';
    const received = Template.parseAttr(source, 'srcset');
    const expected = {
      attr: 'srcset',
      startPos: 28,
      endPos: 66,
      value: [
        { startPos: 0, endPos: 8, value: 'img1.png' },
        { startPos: 10, endPos: 18, value: 'img2.png' },
        { startPos: 25, endPos: 33, value: 'img3.png' },
      ],
    };
    return expect(received).toEqual(expected);
  });
});

describe('resolve parsed values', () => {
  test('https://example.com/style.css', () => {
    const received = Template.resolve({ type: 'style', file: 'https://example.com/style.css', issuer: '' });
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('http://example.com/style.css', () => {
    const received = Template.resolve({ type: 'style', file: 'http://example.com/style.css', issuer: '' });
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('//style.css', () => {
    const received = Template.resolve({ type: 'style', file: '//style.css', issuer: '' });
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('/style.css', () => {
    const received = Template.resolve({ type: 'style', file: '/style.css', issuer: '' });
    const expected = false;
    return expect(received).toEqual(expected);
  });
});

describe('parse tags unit tests', () => {
  test('parse single tag img', () => {
    //const html = `<img src="img1.png" alt="logo"><img src="img1.png" srcset="img2.png 100w, img3.png 500w, img4.png 1000w">`;
    const html = `<img src="img1.png" alt="logo">`;
    const received = Template.parseTag(html, { tag: 'img', attributes: ['src'] });
    const expected = [
      {
        tag: 'img',
        source: '<img src="img1.png" alt="logo">',
        type: 'asset',
        startPos: 0,
        endPos: 31,
        attrs: [
          {
            attr: 'src',
            value: 'img1.png',
            startPos: 10,
            endPos: 18,
          },
        ],
      },
    ];
    return expect(received).toEqual(expected);
  });
});

describe('AssetEntry unit tests', () => {
  test('reset', () => {
    AssetEntry.compilationEntryNames = new Set(['home', 'about']);
    AssetEntry.reset();
    const received = AssetEntry.compilationEntryNames;
    return expect(received).toEqual(new Set());
  });
});

describe('plugin options unit tests', () => {
  test('isTrue: defaultValue', () => {
    const received = Options.toBool(undefined, false, true);
    return expect(received).toEqual(true);
  });

  test('isTrue: value false', () => {
    Options.prodMode = true;
    const received = Options.toBool(false, true, true);
    return expect(received).toEqual(false);
  });

  test('isTrue: value true', () => {
    Options.prodMode = true;
    const received = Options.toBool(true, false, false);
    return expect(received).toEqual(true);
  });

  test('isTrue: "auto", autoValue = true, prod mode', () => {
    Options.prodMode = true;
    const received = Options.toBool('auto', true, false);
    return expect(received).toEqual(true);
  });

  test('isTrue: "auto", autoValue = false, prod mode', () => {
    Options.prodMode = true;
    const received = Options.toBool('auto', false, false);
    return expect(received).toEqual(false);
  });

  test('isTrue: "auto", autoValue = true, dev mode', () => {
    Options.prodMode = false;
    const received = Options.toBool('auto', true, false);
    return expect(received).toEqual(false);
  });

  test('isTrue: "auto", autoValue = false, dev mode', () => {
    Options.prodMode = false;
    const received = Options.toBool('auto', false, false);
    return expect(received).toEqual(true);
  });
});

describe('load module', () => {
  test('FileUtils: load module', (done) => {
    try {
      const ansis = loadModule('ansis');
      expect(ansis).toBeDefined();
      done();
    } catch (error) {
      throw error;
    }
  });
});

describe('misc tests', () => {
  test('FileUtils: resolveFile', () => {
    const received = resolveFile('not-exists-file', { fs, root: __dirname });
    return expect(received).toBeFalsy();
  });
});
