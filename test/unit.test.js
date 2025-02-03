import path from 'path';
import fs from 'fs';

import { findPlugin, getFileExtension, parseVersion, compareVersions } from '../src/Common/Helpers';
import WeakMapIterable from '../src/Common/WeakMapIterable';
import VMScript from '../src/Common/VMScript';
import { HtmlParser } from '../src/Common/HtmlParser';
import {
  isDir,
  asyncLoadModule,
  loadModule,
  resolveFile,
  filterParentPaths,
  relativePathVerbose,
} from '../src/Common/FileUtils';
import {
  stringifyJSON,
  stringifyFn,
  injectBeforeEndHead,
  injectBeforeEndBody,
  escapeSequences,
  escapeCodesForJSON,
} from '../src/Loader/Utils';

import Asset from '../src/Plugin/Asset';
import Template from '../src/Loader/Template';

import AssetEntry from '../src/Plugin/AssetEntry';
import Snapshot from '../src/Plugin/Snapshot';
import Option from '../src/Plugin/Option';
import Collection from '../src/Plugin/Collection';

const asset = new Asset();
const assetEntry = new AssetEntry({});
const collection = new Collection({});
const option = new Option({}, { options: {}, loaderPath: '' });

beforeAll(() => {
  // important: the environment constant is used in code
  // the value must be type string
  process.env.NODE_ENV_TEST = 'true';
});

const compareArrays = (a, b) => {
  let orderA = a.order.split('.');
  let orderB = b.order.split('.');

  let len = Math.min(orderA.length, orderB.length);
  let i;
  for (i = 0; i < len; i++) {
    if (orderA[i] === orderB[i]) continue;

    return orderA[i] < orderB[i] ? -1 : 1;
  }

  return orderA.length !== orderB.length ? (orderA.length < orderB.length ? -1 : 1) : 1;
};

describe('misc', () => {
  test('sort arrays by order index', () => {
    const source = [
      //
      { order: '2.1.1' },
      { order: '3' },
      { order: '2.1' },
      { order: '0.1' },
      { order: '1.2.1' },
      { order: '0' },
      { order: '1.2.0' },
      { order: '2' },
    ];

    const expected = [
      //
      { order: '0' },
      { order: '0.1' },
      { order: '1.2.0' },
      { order: '1.2.1' },
      { order: '2' },
      { order: '2.1' },
      { order: '2.1.1' },
      { order: '3' },
    ];
    const received = source.sort(compareArrays);

    return expect(received).toEqual(expected);
  });
});

describe('compareVersions', () => {
  test('1.2.99 < 1.2.100', () => {
    const expected = compareVersions('1.2.99', '<', '1.2.100');
    const received = true;
    return expect(received).toStrictEqual(expected);
  });

  test('5.95.0 < 5.96.1', () => {
    const expected = compareVersions('5.95.0', '<', '5.96.1');
    const received = true;
    return expect(received).toStrictEqual(expected);
  });

  test('5.95.0 <= 5.96.1', () => {
    const expected = compareVersions('5.95.0', '<=', '5.96.1');
    const received = true;
    return expect(received).toStrictEqual(expected);
  });

  test('5.96.10 >= 5.96.1', () => {
    const expected = compareVersions('5.96.10', '>=', '5.96.1');
    const received = true;
    return expect(received).toStrictEqual(expected);
  });

  test('5.95.0 > 5.96.1', () => {
    const expected = compareVersions('5.95.0', '>', '5.96.1');
    const received = false;
    return expect(received).toStrictEqual(expected);
  });

  test('5.96.1 = 5.96.1', () => {
    const expected = compareVersions('5.96.1', '=', '5.96.1');
    const received = true;
    return expect(received).toStrictEqual(expected);
  });

  test('parseVersion: =5.96.1', () => {
    const received = parseVersion('= 5.96.1');
    const expected = ['=', '5.96.1'];
    return expect(received).toStrictEqual(expected);
  });

  test('parseVersion: >5.96.1', () => {
    const received = parseVersion('>5.96.1');
    const expected = ['>', '5.96.1'];
    return expect(received).toStrictEqual(expected);
  });

  test('parseVersion: >= 5.96.1', () => {
    const received = parseVersion('>= 5.96.1');
    const expected = ['>=', '5.96.1'];
    return expect(received).toStrictEqual(expected);
  });
});

describe('unique filename tests', () => {
  test('js/file.js', () => {
    const received = asset.getUniqueFilename('/src/file.js', 'js/file.js');
    const expected = 'js/file.js';
    asset.reset();
    return expect(received.filename).toStrictEqual(expected);
  });

  test('js/file.1 w/o ext', () => {
    asset.index = {
      'js/file': 1,
    };
    const received = asset.getUniqueFilename('/src/file.js', 'js/file');
    const expected = 'js/file.1';
    asset.reset();
    return expect(received.filename).toStrictEqual(expected);
  });

  test('js/file.1.js', () => {
    asset.index = {
      'js/file.js': 1,
    };
    const received = asset.getUniqueFilename('/src/file.js', 'js/file.js');
    const expected = 'js/file.1.js';
    asset.reset();
    return expect(received.filename).toStrictEqual(expected);
  });

  test('file.a1b2c3d4.1.js', () => {
    asset.index = {
      'js/file.a1b2c3d4.js': 1,
    };
    const received = asset.getUniqueFilename('/src/file.js', 'js/file.a1b2c3d4.js');
    const expected = 'js/file.a1b2c3d4.1.js';
    asset.reset();
    return expect(received.filename).toStrictEqual(expected);
  });

  test('file.1.a1b2c3d4.js cache', () => {
    asset.files = new Map([
      ['/src/file.css', 'css/file.a1b2c3d4.css'],
      ['/src/file.js', 'js/file.1.a1b2c3d4.js'], // <= already cached by source filename
    ]);

    const received = asset.getUniqueFilename('/src/file.js', 'js/file.a1b2c3d4.js');
    const expected = 'js/file.1.a1b2c3d4.js';
    asset.reset();
    return expect(received.filename).toStrictEqual(expected);
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

describe('utils', () => {
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

  test('escapeCodesForJSON', () => {
    const html = '<div data-json="{key: `text\\ntext`}">';
    const received = escapeCodesForJSON(html);
    const expected = '<div data-json="{key: \\`text\\\\ntext\\`}">';
    return expect(received).toEqual(expected);
  });
});

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
});

describe('parse attributes in tag', () => {
  test('parseTag img without src attr', () => {
    const source = '<img alt="apple">';
    const received = HtmlParser.parseTag(source, { tag: 'img', attributes: ['src'] });

    const expected = [
      {
        type: 'asset',
        tag: 'img',
        raw: '<img alt="apple">',
        attrs: { alt: 'apple' },
        parsedAttrs: [],
        startPos: 0,
        endPos: 17,
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag empty value', () => {
    const source = '<img src="">';
    const received = HtmlParser.parseTag(source, { tag: 'img', attributes: ['src'] });
    const expected = [
      {
        type: 'asset',
        tag: 'img',
        raw: source,
        attrs: { src: '' },
        parsedAttrs: [
          {
            attr: 'src',
            value: '',
            parsedValue: [''],
            startPos: 10,
            endPos: 10,
            inEscapedDoubleQuotes: false,
          },
        ],
        startPos: 0,
        endPos: 12,
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag JSON value', () => {
    const source = `<a href="#" data-bigpicture='{ "alt":"big picture", "imgSrc": "./image.png" }'>`;
    const received = HtmlParser.parseTag(source, { tag: 'a', attributes: ['data-bigpicture'] });
    const expected = [
      {
        type: 'asset',
        tag: 'a',
        raw: source,
        attrs: {
          'data-bigpicture': '{ "alt":"big picture", "imgSrc": "./image.png" }',
          href: '#',
        },
        parsedAttrs: [
          {
            attr: 'data-bigpicture',
            value: '{ "alt":"big picture", "imgSrc": "./image.png" }',
            parsedValue: ['{ "alt":"big picture", "imgSrc": "./image.png" }'],
            startPos: 29,
            endPos: 77,
            inEscapedDoubleQuotes: false,
          },
        ],
        startPos: 0,
        endPos: 79,
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag JSON value with require', () => {
    const source = `<a href="#" data-image='{ "alt":"picture", "imgSrc": require("./1.png?size=300"), "bigImgSrc": require("./2.png") }'>`;
    const received = HtmlParser.parseTag(source, { tag: 'a', attributes: ['data-image'] });
    const expected = [
      {
        type: 'asset',
        tag: 'a',
        raw: source,
        attrs: {
          'data-image': '{ "alt":"picture", "imgSrc": require("./1.png?size=300"), "bigImgSrc": require("./2.png") }',
          href: '#',
        },
        parsedAttrs: [
          {
            value: './1.png?size=300',
            startPos: 53,
            endPos: 80,
            quote: '"',
          },
          {
            value: './2.png',
            startPos: 95,
            endPos: 113,
            quote: '"',
          },
        ],
        startPos: 0,
        endPos: 117,
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parse srcset single value', () => {
    const source = '<source srcset="img1.png?size=200 w200">';
    const received = HtmlParser.parseTag(source, { tag: 'source', attributes: ['src', 'srcset'] });
    const expected = [
      {
        type: 'asset',
        tag: 'source',
        raw: source,
        attrs: {
          srcset: 'img1.png?size=200 w200',
        },
        parsedAttrs: [
          {
            attr: 'srcset',
            // TODO: test with a plugin which resizes images via a query param
            value: 'img1.png?size=200',
            startPos: 16,
            endPos: 33,
            inEscapedDoubleQuotes: false,
          },
        ],
        startPos: 0,
        endPos: 40,
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parse srcset many values', () => {
    const source = '<img src="img1.png?size=800" srcset="img1.png, img2.png 100w, img3.png 1.5x">';
    const received = HtmlParser.parseTag(source, { tag: 'img', attributes: ['src', 'srcset'] });
    const expected = [
      {
        type: 'asset',
        tag: 'img',
        raw: source,
        attrs: {
          src: 'img1.png?size=800',
          srcset: 'img1.png, img2.png 100w, img3.png 1.5x',
        },
        // TODO: uniform structure
        parsedAttrs: [
          {
            attr: 'src',
            value: 'img1.png?size=800',
            parsedValue: ['img1.png'],
            startPos: 10,
            endPos: 27,
            inEscapedDoubleQuotes: false,
          },
          {
            attr: 'srcset',
            value: 'img1.png',
            startPos: 37,
            endPos: 45,
            inEscapedDoubleQuotes: false,
          },
          {
            attr: 'srcset',
            value: 'img2.png',
            startPos: 47,
            endPos: 55,
            inEscapedDoubleQuotes: false,
          },
          {
            attr: 'srcset',
            value: 'img3.png',
            startPos: 62,
            endPos: 70,
            inEscapedDoubleQuotes: false,
          },
        ],
        startPos: 0,
        endPos: 77,
      },
    ];
    return expect(received).toEqual(expected);
  });
});

describe('resolve parsed values', () => {
  test('https://example.com/style.css', () => {
    const received = Template.resolveFile({ type: 'style', value: 'https://example.com/style.css', issuer: '' });
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('http://example.com/style.css', () => {
    const received = Template.resolveFile({ type: 'style', value: 'http://example.com/style.css', issuer: '' });
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('//style.css', () => {
    const received = Template.resolveFile({ type: 'style', value: '//style.css', issuer: '' });
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('/style.css', () => {
    const received = Template.resolveFile({ type: 'style', value: '/style.css', issuer: '' });
    const expected = false;
    return expect(received).toEqual(expected);
  });
});

describe('parse tags', () => {
  test('single tag img', () => {
    const html = `<img src="img1.png" alt="logo">`;
    const received = HtmlParser.parseTag(html, { tag: 'img', attributes: ['src'] });
    const expected = [
      {
        tag: 'img',
        raw: '<img src="img1.png" alt="logo">',
        type: 'asset',
        startPos: 0,
        endPos: 31,
        parsedAttrs: [
          {
            attr: 'src',
            value: 'img1.png',
            parsedValue: ['img1.png'],
            startPos: 10,
            endPos: 18,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          alt: 'logo',
          src: 'img1.png',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('single-quoted attribute value', () => {
    const html = `<img src= "img1.png" alt="logo">`;
    const received = HtmlParser.parseTag(html, { tag: 'img', attributes: ['src'] });
    const expected = [
      {
        tag: 'img',
        raw: `<img src= "img1.png" alt="logo">`,
        type: 'asset',
        startPos: 0,
        endPos: 32,
        parsedAttrs: [
          {
            attr: 'src',
            value: 'img1.png',
            parsedValue: ['img1.png'],
            startPos: 11,
            endPos: 19,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          alt: 'logo',
          src: 'img1.png',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag img with srcset', () => {
    const html = `<div><img src="img1.png" alt="logo" srcset="1.png?s=200 200w, 2.png"></div>`;
    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'img', attributes: ['srcset', 'src'] });

    const expected = [
      {
        type: 'asset',
        tag: 'img',
        raw: '<img src="img1.png" alt="logo" srcset="1.png?s=200 200w, 2.png">',
        startPos: 5,
        endPos: 69,
        parsedAttrs: [
          {
            attr: 'src',
            value: 'img1.png',
            parsedValue: ['img1.png'],
            startPos: 15,
            endPos: 23,
            inEscapedDoubleQuotes: false,
          },
          {
            attr: 'srcset',
            value: '1.png?s=200',
            startPos: 44,
            endPos: 55,
            inEscapedDoubleQuotes: false,
          },
          {
            attr: 'srcset',
            value: '2.png',
            startPos: 62,
            endPos: 67,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          alt: 'logo',
          src: 'img1.png',
          srcset: '1.png?s=200 200w, 2.png',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  // TODO: move to separate suit

  test('parseTag <source>', () => {
    const html = `<source>`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,
        type: 'asset',
        startPos: 0,
        endPos: 8,
        parsedAttrs: [],
        attrs: {},
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag <source/>', () => {
    const html = `<source/>`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,
        type: 'asset',
        startPos: 0,
        endPos: 9,
        parsedAttrs: [],
        attrs: {},
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag <source />', () => {
    const html = `<source />`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,
        type: 'asset',
        startPos: 0,
        endPos: 10,
        parsedAttrs: [],
        attrs: {},
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag <source disabled>', () => {
    const html = `<source disabled>`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,

        type: 'asset',
        startPos: 0,
        endPos: 17,
        parsedAttrs: [],
        attrs: {
          disabled: undefined,
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag <source disabled/>', () => {
    const html = `<source disabled/>`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,

        type: 'asset',
        startPos: 0,
        endPos: 18,
        parsedAttrs: [],
        attrs: {
          disabled: undefined,
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag <source disabled />', () => {
    const html = `<source disabled />`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,

        type: 'asset',
        startPos: 0,
        endPos: 19,
        parsedAttrs: [],
        attrs: {
          disabled: undefined,
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag <source disabled="false" />', () => {
    const html = `<source disabled="false" />`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,

        type: 'asset',
        startPos: 0,
        endPos: 27,
        parsedAttrs: [],
        attrs: {
          disabled: 'false',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag <source disabled = false />', () => {
    const html = `<source disabled = false />`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,

        type: 'asset',
        startPos: 0,
        endPos: 27,
        parsedAttrs: [],
        attrs: {
          disabled: 'false',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag <source disabled="false"/>', () => {
    const html = `<source disabled="false"/>`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,

        type: 'asset',
        startPos: 0,
        endPos: 26,
        parsedAttrs: [],
        attrs: {
          disabled: 'false',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag <source disabled = "false"/>', () => {
    const html = `<source disabled = "false"/>`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,

        type: 'asset',
        startPos: 0,
        endPos: 28,
        parsedAttrs: [],
        attrs: {
          disabled: 'false',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag <script src="./main.js" async defer type="text/javascript">', () => {
    const html = `<script src="./main.js" async defer type="text/javascript"></script>`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'script', attributes: ['src'] });

    const expected = [
      {
        tag: 'script',
        raw: `<script src="./main.js" async defer type="text/javascript">`,

        type: 'script',
        startPos: 0,
        endPos: 59,
        parsedAttrs: [
          {
            attr: 'src',
            value: './main.js',
            parsedValue: ['./main.js'],
            startPos: 13,
            endPos: 22,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          async: undefined,
          defer: undefined,
          src: './main.js',
          type: 'text/javascript',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag attributes containing `<` and `>` chars', () => {
    const html = `<source  disabled  =  "false" srcset = "1.png" media="(300px <= width < 400px) and (300px > height => 200px)" />`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,

        type: 'asset',
        startPos: 0,
        endPos: 112,
        parsedAttrs: [
          {
            attr: 'srcset',
            value: '1.png',
            startPos: 40,
            endPos: 45,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          disabled: 'false',
          srcset: '1.png',
          media: '(300px <= width < 400px) and (300px > height => 200px)',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parseTag attributes containing `<` and `>` chars, multiline', () => {
    // OK
    const html = `<source
  disabled  =  "false"
  media="(300px <= width < 400px) and (300px > height => 200px)"
  srcset="
    1.png
  "
  data-bp='{"imgSrc": "./img.jpg" , "class": "gallery" }'
/>`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'source', attributes: ['srcset'] });

    const expected = [
      {
        tag: 'source',
        raw: html,

        type: 'asset',
        startPos: 0,
        endPos: 181,
        parsedAttrs: [
          {
            attr: 'srcset',
            value: `1.png
`,
            startPos: 111,
            endPos: 117,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          disabled: 'false',
          srcset: `
    1.png
  `,
          media: '(300px <= width < 400px) and (300px > height => 200px)',
          'data-bp': '{"imgSrc": "./img.jpg" , "class": "gallery" }',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parse src in many tags, minified', () => {
    const html = `<img class="a1" src="1.png"><img class="a2" src="2.png"><img class="a3" src="3.png">`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'img', attributes: ['src'] });

    const expected = [
      {
        tag: 'img',
        raw: `<img class="a1" src="1.png">`,

        type: 'asset',
        startPos: 0,
        endPos: 28,
        parsedAttrs: [
          {
            attr: 'src',
            value: '1.png',
            parsedValue: ['1.png'],
            startPos: 21,
            endPos: 26,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          class: 'a1',
          src: '1.png',
        },
      },
      {
        tag: 'img',
        raw: `<img class="a2" src="2.png">`,

        type: 'asset',
        startPos: 28,
        endPos: 56,
        parsedAttrs: [
          {
            attr: 'src',
            value: '2.png',
            parsedValue: ['2.png'],
            startPos: 49,
            endPos: 54,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          class: 'a2',
          src: '2.png',
        },
      },
      {
        tag: 'img',
        raw: `<img class="a3" src="3.png">`,

        type: 'asset',
        startPos: 56,
        endPos: 84,
        parsedAttrs: [
          {
            attr: 'src',
            value: '3.png',
            parsedValue: ['3.png'],
            startPos: 77,
            endPos: 82,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          class: 'a3',
          src: '3.png',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });

  test('parse src with require in many tags, minified', () => {
    const html = `<img class="a1" src="require('image1.png')"><img class="a2" src="require('image2.png')"><img class="a3" src="require('image3.png')">`;

    // test sorting of parsed attrs, filter
    const received = HtmlParser.parseTag(html, { tag: 'img', attributes: ['src'] });

    const expected = [
      {
        tag: 'img',
        raw: `<img class="a1" src="require('image1.png')">`,

        type: 'asset',
        startPos: 0,
        endPos: 44,
        parsedAttrs: [
          {
            attr: 'src',
            value: "require('image1.png')",
            parsedValue: ["require('image1.png')"],
            startPos: 21,
            endPos: 42,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          class: 'a1',
          src: "require('image1.png')",
        },
      },
      {
        tag: 'img',
        raw: `<img class="a2" src="require('image2.png')">`,

        type: 'asset',
        startPos: 44,
        endPos: 88,
        parsedAttrs: [
          {
            attr: 'src',
            value: "require('image2.png')",
            parsedValue: ["require('image2.png')"],
            startPos: 65,
            endPos: 86,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          class: 'a2',
          src: "require('image2.png')",
        },
      },
      {
        tag: 'img',
        raw: `<img class="a3" src="require('image3.png')">`,

        type: 'asset',
        startPos: 88,
        endPos: 132,
        parsedAttrs: [
          {
            attr: 'src',
            value: "require('image3.png')",
            parsedValue: ["require('image3.png')"],
            startPos: 109,
            endPos: 130,
            inEscapedDoubleQuotes: false,
          },
        ],
        attrs: {
          class: 'a3',
          src: "require('image3.png')",
        },
      },
    ];
    return expect(received).toEqual(expected);
  });
});

describe('escaped quote', () => {
  test('parseTagAttributes: escaped quote', () => {
    const html = `<img src=\\"img1.png\\" alt=\\"logo\\">`;
    const { attrs: received } = HtmlParser.parseTagAttributes(html, 'img', 0, 5);
    const expected = {
      src: 'img1.png',
      alt: 'logo',
    };
    return expect(received).toEqual(expected);
  });

  test('parseTag: escaped quote', () => {
    const html = `<img src=\\"img1.png\\" alt=\\"logo\\">`;
    const received = HtmlParser.parseTag(html, { tag: 'img', attributes: ['src'] });
    const expected = [
      {
        tag: 'img',
        raw: html,

        type: 'asset',
        startPos: 0,
        endPos: 35,
        parsedAttrs: [
          {
            attr: 'src',
            value: 'img1.png',
            parsedValue: ['img1.png'],
            startPos: 11,
            endPos: 19,
            inEscapedDoubleQuotes: true,
          },
        ],
        attrs: {
          alt: 'logo',
          src: 'img1.png',
        },
      },
    ];
    return expect(received).toEqual(expected);
  });
});

describe('parseTagAttributes', () => {
  test('tag end 01', () => {
    const source = '<script src="file.js">';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 7);
    const expected = { src: 'file.js' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 02', () => {
    const source = '<script src="file.js" >';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 7);
    const expected = { src: 'file.js' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 03', () => {
    const source = '<script defer=true>';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 7);
    const expected = { defer: 'true' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 04', () => {
    const source = '<script defer=true/>';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 7);
    const expected = { defer: 'true' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 05', () => {
    const source = '<script defer=true >';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 7);
    const expected = { defer: 'true' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 06', () => {
    const source = '<script defer>';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 7);
    const expected = { defer: undefined };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 07', () => {
    const source = '<script defer/>';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 7);
    const expected = { defer: undefined };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 08', () => {
    const source = '<script defer >';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 7);
    const expected = { defer: undefined };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 11', () => {
    const source = '<script src="file.js"/>';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 7);
    const expected = { src: 'file.js' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 12', () => {
    const source = '<script src="file.js"  />';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 7);
    const expected = { src: 'file.js' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 31', () => {
    const source = '<br>';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'br', 0, 3);
    const expected = {};
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 32', () => {
    const source = '<br/>';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'br', 0, 3);
    const expected = {};
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 33', () => {
    const source = '<br />';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'br', 0, 3);
    const expected = {};
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 34', () => {
    const source = '<br attr />';
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'br', 0, 3);
    const expected = { attr: undefined };
    return expect(received).toStrictEqual(expected);
  });

  test('all possible values of attribute', () => {
    const source = `<script  defer data-text="text with spaces"  enabled=true empty="" src='file.js'  />`;
    const { attrs: received } = HtmlParser.parseTagAttributes(source, 'script', 0, 8);
    const expected = { defer: undefined, 'data-text': 'text with spaces', enabled: 'true', empty: '', src: 'file.js' };
    return expect(received).toStrictEqual(expected);
  });
});

describe('detect style tag', () => {
  test('rel stylesheet', () => {
    const tag = `<link href="style.css" rel="stylesheet" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'style';
    return expect(received).toStrictEqual(expected);
  });

  test('rel alternate stylesheet', () => {
    const tag = `<link href="style.css" rel="alternate stylesheet" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'style';
    return expect(received).toStrictEqual(expected);
  });

  test('rel icon', () => {
    const tag = `<link href="style.css" rel="icon" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'asset';
    return expect(received).toStrictEqual(expected);
  });

  test('preload as style', () => {
    const tag = `<link href="style.css" rel="preload" as="style" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'style';
    return expect(received).toStrictEqual(expected);
  });

  test('preload as stylesheet', () => {
    const tag = `<link href="style.css" rel="preload" as="stylesheet" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'style';
    return expect(received).toStrictEqual(expected);
  });
});

describe('detect script tag', () => {
  test('rel prefetch as script', () => {
    const tag = `<link href="script.js" rel="prefetch" as="script" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'script';
    return expect(received).toStrictEqual(expected);
  });

  test('rel preload as script', () => {
    const tag = `<link href="script.js" rel="preload" as="script" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'script';
    return expect(received).toStrictEqual(expected);
  });

  test('rel modulepreload', () => {
    const tag = `<link href="script.js" rel="modulepreload" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'script';
    return expect(received).toStrictEqual(expected);
  });

  test('rel modulepreload as script', () => {
    const tag = `<link href="script.js" rel="modulepreload" as="script" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'script';
    return expect(received).toStrictEqual(expected);
  });

  test('rel modulepreload as worker', () => {
    const tag = `<link href="script.js" rel="modulepreload" as="worker" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'script';
    return expect(received).toStrictEqual(expected);
  });

  test('rel modulepreload as serviceworker', () => {
    const tag = `<link href="script.js" rel="modulepreload" as="serviceworker" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'script';
    return expect(received).toStrictEqual(expected);
  });

  test('rel modulepreload as sharedworker', () => {
    const tag = `<link href="script.js" rel="modulepreload" as="sharedworker" />`;
    const res = HtmlParser.parseTag(tag, { tag: 'link', attributes: [] });
    const received = res[0].type;
    const expected = 'script';
    return expect(received).toStrictEqual(expected);
  });
});

describe('Parse Exceptions', () => {
  test('missing the closing quote', () => {
    const source = '<div><img src="image.png  /></div>';

    const received = () => {
      const res = HtmlParser.parseTagAttributes(source, 'img', 5, 4);
    };

    const expected = `The 'img' 'src' attribute, starting at 14 position, is missing a closing quote`;
    return expect(received).toThrow(expected);
  });
});

describe('AssetEntry unit tests', () => {
  test('reset', () => {
    assetEntry.compilationEntryNames = new Set(['home', 'about']);
    assetEntry.reset();
    const received = assetEntry.compilationEntryNames;
    return expect(received).toEqual(new Set());
  });
});

describe('plugin options unit tests', () => {
  test('isTrue: defaultValue', () => {
    const received = option.toBool(undefined, false, true);
    return expect(received).toEqual(true);
  });

  test('isTrue: value false', () => {
    option.productionMode = true;
    const received = option.toBool(false, true, true);
    return expect(received).toEqual(false);
  });

  test('isTrue: value true', () => {
    option.productionMode = true;
    const received = option.toBool(true, false, false);
    return expect(received).toEqual(true);
  });

  test('isTrue: "auto", autoValue = true, prod mode', () => {
    option.productionMode = true;
    const received = option.toBool('auto', true, false);
    return expect(received).toEqual(true);
  });

  test('isTrue: "auto", autoValue = false, prod mode', () => {
    option.productionMode = true;
    const received = option.toBool('auto', false, false);
    return expect(received).toEqual(false);
  });

  test('isTrue: "auto", autoValue = true, dev mode', () => {
    option.productionMode = false;
    const received = option.toBool('auto', true, false);
    return expect(received).toEqual(false);
  });

  test('isTrue: "auto", autoValue = false, dev mode', () => {
    option.productionMode = false;
    const received = option.toBool('auto', false, false);
    return expect(received).toEqual(true);
  });

  test('isProduction true', () => {
    option.productionMode = true;
    const received = option.isProduction();
    return expect(received).toEqual(true);
  });

  test('isRealContentHash true', () => {
    option.webpackOptions.optimization = {
      realContentHash: true,
    };
    const received = option.isRealContentHash();
    return expect(received).toEqual(true);
  });

  test('isScript true', () => {
    option.options = {
      js: {
        enabled: true,
        test: option.js.test,
      },
    };

    const received = option.isScript('test.js?v=123');
    return expect(received).toEqual(true);
  });

  test('getEntryPath', () => {
    option.dynamicEntry = 'src/views/';
    option.options.entry = option.dynamicEntry;

    const received = option.getEntryPath();
    return expect(received).toEqual(option.dynamicEntry);
  });
});

describe('plugin isInlineCss option', () => {
  // css.inline: true
  test('css.inline:true;', () => {
    option.productionMode = true;
    option.options.css = { inline: true };
    const received = option.isInlineCss('file.css');
    return expect(received).toEqual(true);
  });

  test('css.inline:true; ?inline', () => {
    option.productionMode = true;
    option.options.css = { inline: true };
    const received = option.isInlineCss('file.css?inline');
    return expect(received).toEqual(true);
  });

  test('css.inline:true; ?inline=true', () => {
    option.productionMode = true;
    option.options.css = { inline: true };
    const received = option.isInlineCss('file.css?inline=true');
    return expect(received).toEqual(true);
  });

  test('css.inline:true; ?inline=false', () => {
    option.productionMode = true;
    option.options.css = { inline: true };
    const received = option.isInlineCss('file.css?inline=false');
    return expect(received).toEqual(false);
  });

  // css.inline: false
  test('css.inline:false;', () => {
    option.productionMode = true;
    option.options.css = { inline: false };
    const received = option.isInlineCss('file.css');
    return expect(received).toEqual(false);
  });

  test('css.inline:false; ?inline', () => {
    option.productionMode = true;
    option.options.css = { inline: false };
    const received = option.isInlineCss('file.css?inline');
    return expect(received).toEqual(true);
  });

  test('css.inline:false; ?inline=true', () => {
    option.productionMode = true;
    option.options.css = { inline: false };
    const received = option.isInlineCss('file.css?inline=true');
    return expect(received).toEqual(true);
  });

  test('css.inline:false; ?inline=false', () => {
    option.productionMode = true;
    option.options.css = { inline: false };
    const received = option.isInlineCss('file.css?inline=false');
    return expect(received).toEqual(false);
  });
});

describe('asyncLoadModule', () => {
  test('example.cjs', async () => {
    // usage example
    // (async () => {
    //   // dynamically load CommonJS module
    //   const commonJSModule = await asyncLoadModule('./fixtures/modules/example.cjs');
    //   console.log('Loaded CommonJS Module:', commonJSModule);
    // })();

    const commonJSModule = await asyncLoadModule(path.join(__dirname, './fixtures/modules/example.cjs'));
    const received = commonJSModule.message;
    const expected = 'Hello from CommonJS';

    expect(expected).toEqual(received);
  });

  test('example-cjs.js', async () => {
    const esmModule = await asyncLoadModule(path.join(__dirname, './fixtures/modules/example-cjs.js'));
    const received = esmModule.message;
    const expected = 'Hello from .js file';

    expect(received).toEqual(expected);
  });

  // Jest doesn't support ESM without --experimental-vm-modules
  test('example.mjs', async () => {
    const esmModule = await asyncLoadModule(path.join(__dirname, './fixtures/modules/example.mjs'));
    const received = esmModule.message;
    const expected = 'Hello from ESM';

    expect(received).toEqual(expected);
  });

  test('example-esm.js', async () => {
    const esmModule = await asyncLoadModule(path.join(__dirname, './fixtures/modules/example-esm.js'));
    const received = esmModule.message;
    const expected = 'Hello from .js file';

    expect(received).toEqual(expected);
  });
});

describe('FileUtils Sync', () => {
  test('load module', (done) => {
    try {
      const ansis = loadModule('ansis');
      expect(ansis).toBeDefined();
      done();
    } catch (error) {
      throw error;
    }
  });

  test('isDir', () => {
    const received = isDir({ fs, file: __dirname });
    return expect(received).toBeTruthy();
  });

  test('resolveFile', () => {
    const received = resolveFile('not-exists-file', { fs, root: __dirname });
    return expect(received).toBeFalsy();
  });

  test('filterParentPaths', () => {
    const paths = [
      '/root/src/views/',
      '/root/src/views/partials/',
      '/root/src/',
      '/root/src/views/includes/',
      '/root/templates/partials/',
      '/root/templates/',
      '/root/templates/includes/',
      '/root/libs/a/src/',
      '/root/libs/a/',
      '/root/libs/a/app/',
    ];

    const expected = ['/root/src/', '/root/libs/a/', '/root/templates/'];
    const received = filterParentPaths(paths);

    return expect(received).toEqual(expected);
  });

  test('relativePathVerbose absolute file', () => {
    const received = relativePathVerbose('/root/src/view/index.html', '/root/src/');
    const expected = 'view/index.html';
    return expect(received).toEqual(expected);
  });

  test('relativePathVerbose absolute file test', () => {
    const received = relativePathVerbose('/bar/src/webpack-plugin/test/view/index.html', '/foo/src/');
    const expected = '~view/index.html';
    return expect(received).toEqual(expected);
  });

  test('relativePathVerbose absolute file src', () => {
    const received = relativePathVerbose('/bar/src/webpack-plugin/src/view/index.html', '/foo/src/');
    const expected = '~webpack-plugin/src/view/index.html';
    return expect(received).toEqual(expected);
  });

  test('relativePathVerbose relative file', () => {
    const received = relativePathVerbose('./view/index.html', '/root/src/');
    const expected = 'view/index.html';

    return expect(received).toEqual(expected);
  });

  test('relativePathVerbose alias', () => {
    const received = relativePathVerbose('@alias/styles.css', '/root/src/');
    const expected = '@alias/styles.css';

    return expect(received).toEqual(expected);
  });

  test('relativePathVerbose alias2', () => {
    const received = relativePathVerbose('/root/app/node_modules/@package/dist/styles.css', '/root/app/src');
    const expected = '@package/dist/styles.css';

    return expect(received).toEqual(expected);
  });
});

describe('VMScript', () => {
  test('code string', () => {
    const vm = new VMScript();
    const code = ` 1 + 2;`;

    const received = vm.exec(code, { filename: __filename });
    const expected = 3;
    return expect(received).toEqual(expected);
  });

  test('code buffer', () => {
    const vm = new VMScript();
    const code = ` 1 + 2;`;
    const codeBuffer = Buffer.from(code);

    const received = vm.exec(codeBuffer, { filename: __filename });
    const expected = 3;
    return expect(received).toEqual(expected);
  });
});

describe('Snapshot', () => {
  test('create', () => {
    Snapshot.prevFiles = ['/src/a.js'];
    Snapshot.currFiles = ['/src/b.js', '/src/c.js'];

    Snapshot.init({
      fs,
      dir: [],
      includes: [],
    });

    Snapshot.create();

    const received = Snapshot.prevFiles;
    const expected = ['/src/b.js', '/src/c.js'];
    return expect(received).toEqual(expected);
  });

  test('getOldFiles', () => {
    Snapshot.prevFiles = ['/src/a.js', '/src/b.js'];
    Snapshot.currFiles = ['/src/a.js'];

    const received = Snapshot.getOldFiles();
    const expected = ['/src/b.js'];
    return expect(received).toEqual(expected);
  });

  test('getNewFiles', () => {
    Snapshot.prevFiles = ['/src/a.js'];
    Snapshot.currFiles = ['/src/a.js', '/src/b.js'];

    const received = Snapshot.getNewFiles();
    const expected = ['/src/b.js'];
    return expect(received).toEqual(expected);
  });

  test('detectFileChange: add', () => {
    Snapshot.prevFiles = ['/src/a.js'];
    Snapshot.currFiles = ['/src/a.js', '/src/b.js'];

    const received = Snapshot.detectFileChange();
    const expected = { actionType: 'add', oldFileName: '', newFileName: '/src/b.js' };
    return expect(received).toEqual(expected);
  });

  test('detectFileChange: remove', () => {
    Snapshot.prevFiles = ['/src/a.js', '/src/b.js'];
    Snapshot.currFiles = ['/src/a.js'];

    const received = Snapshot.detectFileChange();
    const expected = { actionType: 'remove', oldFileName: '/src/b.js', newFileName: '' };
    return expect(received).toEqual(expected);
  });

  test('detectFileChange: rename', () => {
    Snapshot.prevFiles = ['/src/a.js'];
    Snapshot.currFiles = ['/src/b.js'];

    const received = Snapshot.detectFileChange();
    const expected = { actionType: 'rename', oldFileName: '/src/a.js', newFileName: '/src/b.js' };
    return expect(received).toEqual(expected);
  });

  test('detectFileChange: modify', () => {
    Snapshot.prevFiles = ['/src/a.js'];
    Snapshot.currFiles = ['/src/a.js'];

    const received = Snapshot.detectFileChange();
    const expected = { actionType: 'modify', oldFileName: '', newFileName: '' };
    return expect(received).toEqual(expected);
  });

  test('hasMissingFile: true', () => {
    const issuer = '/src/about.html';
    const file = '/src/a.js';

    Snapshot.addMissingFile(issuer, file);

    const received = Snapshot.hasMissingFile(issuer, '/path/to/src/a.js');
    const expected = true;
    return expect(received).toEqual(expected);
  });

  test('hasMissingFile: false', () => {
    const issuer = '/src/about.html';
    const file = '/src/a.js';

    Snapshot.addMissingFile(issuer, file);

    const received = Snapshot.hasMissingFile(issuer, '/src/b.js');
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('addMissingFile', () => {
    const issuer = '/src/about.html';
    const file = '/src/a.js';

    Snapshot.addMissingFile(issuer, file);

    const received = Snapshot.missingFiles;
    const expected = new Map([[issuer, new Set([file])]]);
    return expect(received).toEqual(expected);
  });

  test('getMissingFiles', () => {
    const issuer = '/src/about.html';
    const file = '/src/a.js';

    Snapshot.addMissingFile(issuer, file);

    const received = Snapshot.getMissingFiles();
    const expected = new Map([[issuer, new Set([file])]]);
    return expect(received).toEqual(expected);
  });

  test('deleteMissingFile', () => {
    const issuer = '/src/about.html';
    const file = '/src/a.js';

    Snapshot.addMissingFile(issuer, '/src/a.js');
    Snapshot.addMissingFile(issuer, '/src/b.js');
    Snapshot.deleteMissingFile(issuer, '/src/b.js');

    const received = Snapshot.getMissingFiles();
    const expected = new Map([[issuer, new Set([file])]]);
    return expect(received).toEqual(expected);
  });
});

describe('WeakMapIterable', () => {
  test('getter setter', () => {
    const wakeMap = new WeakMapIterable();
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };

    wakeMap.set(obj1, 'bar');
    wakeMap.set(obj2, 'foo');

    const received = wakeMap.get(obj1);
    const expected = 'bar';
    return expect(received).toEqual(expected);
  });

  test('has', () => {
    const wakeMap = new WeakMapIterable();
    const obj1 = { a: 1 };

    wakeMap.set(obj1, 'bar');

    const received = wakeMap.has(obj1);
    const expected = true;
    return expect(received).toEqual(expected);
  });

  test('delete', () => {
    const wakeMap = new WeakMapIterable();
    const obj1 = { a: 1 };

    wakeMap.set(obj1, 'bar');
    wakeMap.delete(obj1);

    const received = wakeMap.has(obj1);
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('clear', () => {
    const wakeMap = new WeakMapIterable();
    const obj1 = { a: 1 };

    wakeMap.set(obj1, 'bar');
    wakeMap.clear();

    const received = wakeMap.has(obj1);
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('iterator', () => {
    const wakeMap = new WeakMapIterable([
      [{ a: 1 }, 'bar'],
      [{ b: 2 }, 'foo'],
    ]);

    const values = [];
    for (let val of wakeMap) {
      values.push(val);
    }

    const received = values;
    const expected = ['bar', 'foo'];
    return expect(received).toEqual(expected);
  });
});

describe('misc tests', () => {
  test('ordered array', () => {
    const data = [];
    data[5] = 'c';
    data[3] = 'b';
    data[1] = 'a';

    const received = data.flat(); // OK
    //const received = [...data]; // empty slots
    const expected = ['a', 'b', 'c'];
    return expect(received).toStrictEqual(expected);
  });

  test('findPlugin', () => {
    class MyPlugin {
      constructor() {}
    }

    const myPluginInstance = new MyPlugin();
    const plugins = [myPluginInstance];
    const received = findPlugin(plugins, 'MyPlugin');
    return expect(received).toBeInstanceOf(MyPlugin);
  });

  test('Collection.findStyleInsertPos OK', () => {
    const content = `<html><head></head><body></body></html>`;
    const received = collection.findStyleInsertPos(content);
    const expected = 12;
    return expect(received).toEqual(expected);
  });

  test('Collection.findStyleInsertPos OK before script', () => {
    const content = `<html><head><link><script></script></head><body></body></html>`;
    const received = collection.findStyleInsertPos(content);
    const expected = 18;
    return expect(received).toEqual(expected);
  });

  test('Collection.findStyleInsertPos no open head', () => {
    const content = `<html></head><body></body></html>`;
    const received = collection.findStyleInsertPos(content);
    const expected = -1;
    return expect(received).toEqual(expected);
  });

  test('Collection.findStyleInsertPos no close head', () => {
    const content = `<html><head><body></body></html>`;
    const received = collection.findStyleInsertPos(content);
    const expected = -1;
    return expect(received).toEqual(expected);
  });
});
