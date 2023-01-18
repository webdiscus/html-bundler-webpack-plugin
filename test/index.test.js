import path from 'path';
import { compareFileListAndContent, exceptionContain, stdoutContain } from './utils/helpers';
import { PluginError, PluginException } from '../src/Messages/Exception';
import { parseQuery } from '../src/Utils';
import AssetEntry from '../src/AssetEntry';

import HtmlBundler from '../src/Loader/HtmlBundler';

const PATHS = {
  base: __dirname,
  testSource: path.join(__dirname, 'cases'),
  // relative path in the test directory to web root dir name, same as by a web server (e.g. nginx)
  //webRoot: '/public/',
  webRoot: '/dist/',
  // relative path in the test directory to expected files for test
  expected: '/expected/',
  // relative path in the public directory
  output: '/assets/',
};

const testTimeout = 5000;

beforeAll(() => {});

beforeEach(() => {
  // on linux/macOS not work set the testTimeout in jest.config.js
  jest.setTimeout(testTimeout);
});

describe('misc unit tests', () => {
  test('parseQuery array', (done) => {
    const received = parseQuery('file.pug?key=val&arr[]=a&arr[]=1');
    const expected = {
      key: 'val',
      arr: ['a', '1'],
    };
    expect(received).toEqual(expected);
    done();
  });

  test('parseQuery json5', (done) => {
    const received = parseQuery('file.pug?{sizes:[10,20,30], format: "webp"}');
    const expected = {
      format: 'webp',
      sizes: [10, 20, 30],
    };
    expect(received).toEqual(expected);
    done();
  });
});

describe('parse attributes unit tests', () => {
  test('parseAttr without attr', (done) => {
    const source = '<img alt="apple">';
    const received = HtmlBundler.parseAttr(source, 'src');
    const expected = false;
    expect(received).toEqual(expected);
    done();
  });

  test('parseAttr empty value', (done) => {
    const source = '<img src="">';
    const received = HtmlBundler.parseAttr(source, 'src');
    const expected = {
      attr: 'src',
      startPos: 10,
      endPos: 10,
      value: '',
    };
    expect(received).toEqual(expected);
    done();
  });

  test('parseAttr value', (done) => {
    const source = '<img src="img1.png" srcset="img1.png, img2.png 100w, img3.png 1.5x">';
    const received = HtmlBundler.parseAttr(source, 'src');
    const expected = {
      attr: 'src',
      startPos: 10,
      endPos: 18,
      value: 'img1.png',
    };
    expect(received).toEqual(expected);
    done();
  });

  test('parseSrcset single value', (done) => {
    const source = '<source srcset="img1.png">';
    const received = HtmlBundler.parseSrcset(source, 'srcset');
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
    expect(received).toEqual(expected);
    done();
  });

  test('parseSrcset multi values', (done) => {
    const source = '<img src="img1.png" srcset="img1.png, img2.png 100w, img3.png 1.5x">';
    const received = HtmlBundler.parseSrcset(source, 'srcset');
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
    expect(received).toEqual(expected);
    done();
  });
});

describe('resolve parsed values', () => {
  test('https://example.com/style.css', (done) => {
    const received = HtmlBundler.resolve({ type: 'style', file: 'https://example.com/style.css', issuer: '' });
    const expected = false;
    expect(received).toEqual(expected);
    done();
  });

  test('http://example.com/style.css', (done) => {
    const received = HtmlBundler.resolve({ type: 'style', file: 'http://example.com/style.css', issuer: '' });
    const expected = false;
    expect(received).toEqual(expected);
    done();
  });

  test('//style.css', (done) => {
    const received = HtmlBundler.resolve({ type: 'style', file: '//style.css', issuer: '' });
    const expected = false;
    expect(received).toEqual(expected);
    done();
  });

  test('/style.css', (done) => {
    const received = HtmlBundler.resolve({ type: 'style', file: '/style.css', issuer: '' });
    const expected = false;
    expect(received).toEqual(expected);
    done();
  });
});

describe('parse tags unit tests', () => {
  test('parse single tag img', (done) => {
    //const html = `<img src="img1.png" alt="logo"><img src="img1.png" srcset="img2.png 100w, img3.png 500w, img4.png 1000w">`;
    const html = `<img src="img1.png" alt="logo">`;
    const received = HtmlBundler.parseTag(html, { tagName: 'img', attrs: ['src'] });
    const expected = [
      {
        tagName: 'img',
        tagSource: '<img src="img1.png" alt="logo">',
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
    expect(received).toEqual(expected);
    done();
  });

  test('parse all resources in html', (done) => {
    const html = `
<html>
   <head>
     <script src="./main.js" />
     <link href="./style.css" rel="stylesheet" />
     <link href="./basic.css" rel="alternate stylesheet" />
     <link href="./favicon.ico" rel="icon" />
     <link href="./my-font.woff2" rel="preload" as="font" type="font/woff2" />
   </head>
   <body>
     <!-- test tags sort -->
     <source srcset="./fig1.png, ./fig2.png 100w, ./fig3.png 1.5x">
     <img src="./apple.png" alt="apple">
     <!-- test attributes sort -->
     <img srcset="./lime1.png, ./lime2.png 100w, ./lime3.png 1.5x" src="./lime.png">
     <source srcset="./plum.webp" type="image/webp" />
   </body>
</html>
 `;
    const received = HtmlBundler.parseTags(html);
    const expected = [
      {
        tagName: 'script',
        tagSource: '<script src="./main.js" />',
        type: 'script',
        startPos: 23,
        endPos: 49,
        attrs: [
          {
            attr: 'src',
            value: './main.js',
            startPos: 13,
            endPos: 22,
          },
        ],
      },
      {
        tagName: 'link',
        tagSource: '<link href="./style.css" rel="stylesheet" />',
        type: 'style',
        startPos: 55,
        endPos: 99,
        attrs: [
          {
            attr: 'href',
            value: './style.css',
            startPos: 12,
            endPos: 23,
          },
        ],
      },
      {
        tagName: 'link',
        tagSource: '<link href="./basic.css" rel="alternate stylesheet" />',
        type: 'style',
        startPos: 105,
        endPos: 159,
        attrs: [
          {
            attr: 'href',
            value: './basic.css',
            startPos: 12,
            endPos: 23,
          },
        ],
      },
      {
        tagName: 'link',
        tagSource: '<link href="./favicon.ico" rel="icon" />',
        type: 'asset',
        startPos: 165,
        endPos: 205,
        attrs: [
          {
            attr: 'href',
            value: './favicon.ico',
            startPos: 12,
            endPos: 25,
          },
        ],
      },
      {
        tagName: 'link',
        tagSource: '<link href="./my-font.woff2" rel="preload" as="font" type="font/woff2" />',
        type: 'asset',
        startPos: 211,
        endPos: 284,
        attrs: [
          {
            attr: 'href',
            value: './my-font.woff2',
            startPos: 12,
            endPos: 27,
          },
        ],
      },
      {
        tagName: 'source',
        tagSource: '<source srcset="./fig1.png, ./fig2.png 100w, ./fig3.png 1.5x">',
        type: 'asset',
        startPos: 340,
        endPos: 402,
        attrs: [
          {
            attr: 'srcset',
            startPos: 16,
            endPos: 60,
            value: [
              {
                value: './fig1.png',
                startPos: 0,
                endPos: 10,
              },
              {
                value: './fig2.png',
                startPos: 12,
                endPos: 22,
              },
              {
                value: './fig3.png',
                startPos: 29,
                endPos: 39,
              },
            ],
          },
        ],
      },
      {
        tagName: 'img',
        tagSource: '<img src="./apple.png" alt="apple">',
        type: 'asset',
        startPos: 408,
        endPos: 443,
        attrs: [
          {
            attr: 'src',
            value: './apple.png',
            startPos: 10,
            endPos: 21,
          },
        ],
      },
      {
        tagName: 'img',
        tagSource: '<img srcset="./lime1.png, ./lime2.png 100w, ./lime3.png 1.5x" src="./lime.png">',
        type: 'asset',
        startPos: 484,
        endPos: 563,
        attrs: [
          {
            attr: 'srcset',
            startPos: 13,
            endPos: 60,
            value: [
              {
                value: './lime1.png',
                startPos: 0,
                endPos: 11,
              },
              {
                value: './lime2.png',
                startPos: 13,
                endPos: 24,
              },
              {
                value: './lime3.png',
                startPos: 31,
                endPos: 42,
              },
            ],
          },
          {
            attr: 'src',
            value: './lime.png',
            startPos: 67,
            endPos: 77,
          },
        ],
      },
      {
        tagName: 'source',
        tagSource: '<source srcset="./plum.webp" type="image/webp" />',
        type: 'asset',
        startPos: 569,
        endPos: 618,
        attrs: [
          {
            attr: 'srcset',
            startPos: 16,
            endPos: 27,
            value: [
              {
                value: './plum.webp',
                startPos: 0,
                endPos: 11,
              },
            ],
          },
        ],
      },
    ];
    expect(received).toEqual(expected);
    done();
  });

  test('optimize parsed tags', (done) => {
    const html = `
<html>
   <head>
     <script src="./main.js" />
     <link href="./style.css" rel="stylesheet" />
     <link href="./basic.css" rel="alternate stylesheet" />
     <link href="./favicon.ico" rel="icon" />
     <link href="./my-font.woff2" rel="preload" as="font" type="font/woff2" />
   </head>
   <body>
     <!-- test tags sort -->
     <source srcset="./fig1.png, ./fig2.png 100w, ./fig3.png 1.5x">
     <img src="./apple.png" alt="apple">
     <!-- test attributes sort -->
     <img srcset="./lime1.png, ./lime2.png 100w, ./lime3.png 1.5x" src="./lime.png">
     <source srcset="./plum.webp" type="image/webp" />
   </body>
</html>
 `;
    const tags = HtmlBundler.parseTags(html);
    const received = HtmlBundler.optimizeParsedTags(tags);
    const expected = [
      {
        type: 'script',
        file: './main.js',
        endPos: 45,
        startPos: 36,
      },
      {
        file: './style.css',
        type: 'style',
        startPos: 67,
        endPos: 78,
      },
      {
        type: 'style',
        file: './basic.css',
        startPos: 117,
        endPos: 128,
      },
      {
        type: 'asset',
        file: './favicon.ico',
        startPos: 177,
        endPos: 190,
      },
      {
        type: 'asset',
        file: './my-font.woff2',
        startPos: 223,
        endPos: 238,
      },
      {
        type: 'asset',
        file: './fig1.png',
        startPos: 356,
        endPos: 366,
      },
      {
        type: 'asset',
        file: './fig2.png',
        startPos: 368,
        endPos: 378,
      },
      {
        type: 'asset',
        file: './fig3.png',
        startPos: 385,
        endPos: 395,
      },
      {
        type: 'asset',
        file: './apple.png',
        startPos: 418,
        endPos: 429,
      },
      {
        type: 'asset',
        file: './lime1.png',
        startPos: 497,
        endPos: 508,
      },
      {
        type: 'asset',
        file: './lime2.png',
        startPos: 510,
        endPos: 521,
      },
      {
        type: 'asset',
        file: './lime3.png',
        startPos: 528,
        endPos: 539,
      },
      {
        type: 'asset',
        file: './lime.png',
        startPos: 551,
        endPos: 561,
      },
      {
        type: 'asset',
        file: './plum.webp',
        startPos: 585,
        endPos: 596,
      },
    ];
    expect(received).toEqual(expected);
    done();
  });
});

describe('AssetEntry unit tests', () => {
  test('inEntry false', (done) => {
    const received = AssetEntry.inEntry('file.js');
    expect(received).toBeFalsy();
    done();
  });

  test('reset', (done) => {
    AssetEntry.compilationEntryNames = new Set(['home', 'about']);
    AssetEntry.reset();
    const received = AssetEntry.compilationEntryNames;
    expect(received).toEqual(new Set());
    done();
  });
});

describe('features tests', () => {
  test('Hello World!', (done) => {
    compareFileListAndContent(PATHS, 'hello-world', done);
  });

  test('resolve-script-style-asset', (done) => {
    compareFileListAndContent(PATHS, 'resolve-script-style-asset', done);
  });

  test('resolve-relative-paths', (done) => {
    compareFileListAndContent(PATHS, 'resolve-relative-paths', done);
  });

  test('resolve-alias-in-html', (done) => {
    compareFileListAndContent(PATHS, 'resolve-alias-in-html', done);
  });

  //
  test('resolve the url(image) in CSS', (done) => {
    compareFileListAndContent(PATHS, 'resolve-url-in-css', done);
  });

  test('@import url() in CSS', (done) => {
    compareFileListAndContent(PATHS, 'import-url-in-css', done);
  });

  test('@import url() in SCSS', (done) => {
    compareFileListAndContent(PATHS, 'import-url-in-scss', done);
  });
});

describe('options', () => {
  test('option-filename-function', (done) => {
    compareFileListAndContent(PATHS, 'option-filename-function', done);
  });
});

describe('inline images', () => {
  test('inline-asset-bypass-data-url', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-bypass-data-url', done);
  });

  test('inline-asset-decide-size', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-decide-size', done);
  });

  test('inline-asset-query', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-query', done);
  });

  test('inline-asset-html-css', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-html-css', done);
  });

  test('inline-asset-exclude-svg-fonts', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-exclude-svg-fonts', done);
  });

  test('inline-asset-svg-favicon', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-svg-favicon', done);
  });
});

describe('inline styles & scripts', () => {
  test('inline style using URL query `?inline` and resolve url() in CSS', (done) => {
    compareFileListAndContent(PATHS, 'inline-style-query', done);
  });

  test('inline style with source map using URL query `?inline`', (done) => {
    compareFileListAndContent(PATHS, 'inline-style-query-with-source-map', done);
  });

  test('inline script using URL query `?inline`', (done) => {
    compareFileListAndContent(PATHS, 'inline-script-query', done);
  });
});
