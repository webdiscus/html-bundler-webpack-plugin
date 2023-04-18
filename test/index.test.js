import fs from 'fs';
import path from 'path';

import {
  compareFileListAndContent,
  exceptionContain,
  stdoutContain,
  watchCompareFileListAndContent,
  watchExceptionContain,
  watchStdoutContain,
  watchStdoutCompare,
} from './utils/helpers';
import { removeDirsSync, syncExpected } from './utils/file';
import { parseQuery, getFileExtension } from '../src/Common/Helpers';
import { loadModule, resolveFile } from '../src/Common/FileUtils';
import AssetEntry from '../src/Plugin/AssetEntry';
import Template from '../src/Loader/Template';
import { injectBeforeEndHead, injectBeforeEndBody } from '../src/Loader/Utils';
import Options from '../src/Plugin/Options';
import { PATHS } from './config';

// !!! ATTENTION - DANGER !!!
// After update packages and clean install, the new generated hashed filenames may be different from already expected.
// In this case enable function `syncExpected` and run any single test, e.g. `hello world` only once. Then disable it.
// syncExpected(path.join(__dirname, 'cases'), { from: 'dist', to: 'expected' });

beforeAll(() => {
  // remove all 'dist/' directories from tests, use it only for some local tests
  //removeDirsSync(__dirname, /dist$/);
});

beforeEach(() => {});

describe('misc unit tests', () => {
  test('parseQuery array', (done) => {
    const received = parseQuery('file.html?key=val&arr[]=a&arr[]=1');
    const expected = {
      key: 'val',
      arr: ['a', '1'],
    };
    expect(received).toEqual(expected);
    done();
  });

  test('parseQuery json5', (done) => {
    const received = parseQuery('file.html?{sizes:[10,20,30], format: "webp"}');
    const expected = {
      format: 'webp',
      sizes: [10, 20, 30],
    };
    expect(received).toEqual(expected);
    done();
  });

  test('FileUtils: load module', (done) => {
    try {
      const ansis = loadModule('ansis');
      expect(ansis).toBeDefined();
      done();
    } catch (error) {
      throw error;
    }
  });

  test('FileUtils: resolveFile', (done) => {
    const received = resolveFile('not-exists-file', { fs, root: __dirname });
    expect(received).toBeFalsy();
    done();
  });
});

describe('file extension', () => {
  test('file.ext', (done) => {
    const received = getFileExtension('file.ext');
    const expected = 'ext';
    expect(received).toEqual(expected);
    done();
  });

  test('file.ext?query', (done) => {
    const received = getFileExtension('file.ext?query');
    const expected = 'ext';
    expect(received).toEqual(expected);
    done();
  });

  test('file', (done) => {
    const received = getFileExtension('file');
    const expected = '';
    expect(received).toEqual(expected);
    done();
  });

  test('file?query', (done) => {
    const received = getFileExtension('file?query');
    const expected = '';
    expect(received).toEqual(expected);
    done();
  });

  test('path.sample/file', (done) => {
    const received = getFileExtension('path.sample/file');
    const expected = '';
    expect(received).toEqual(expected);
    done();
  });

  test('path.sample/file?query', (done) => {
    const received = getFileExtension('path.sample/file?query');
    const expected = '';
    expect(received).toEqual(expected);
    done();
  });

  test('path.sample\\file', (done) => {
    const received = getFileExtension('path.sample\\file', true);
    const expected = '';
    expect(received).toEqual(expected);
    done();
  });

  test('path.sample\\file.ext?query', (done) => {
    const received = getFileExtension('path.sample\\file.ext?query', true);
    const expected = 'ext';
    expect(received).toEqual(expected);
    done();
  });
});

describe('utils unit tests', () => {
  test('injectBeforeEndHead', (done) => {
    const html = `<html><head><title>test</title></head><body><p>body</p></body></html>`;
    const received = injectBeforeEndHead(html, `<script src="test.js"></script>`);
    const expected = `<html><head><title>test</title><script src="test.js"></script></head><body><p>body</p></body></html>`;
    expect(received).toEqual(expected);
    done();
  });

  test('injectBeforeEndHead without head', (done) => {
    const html = `<html><body><p>body</p></body></html>`;
    const received = injectBeforeEndHead(html, `<script src="test.js"></script>`);
    const expected = `<html><body><p>body</p><script src="test.js"></script></body></html>`;
    expect(received).toEqual(expected);
    done();
  });

  test('injectBeforeEndBody', (done) => {
    const html = `<html><head><title>test</title></head><body><p>body</p></body></html>`;
    const received = injectBeforeEndBody(html, `<script src="test.js"></script>`);
    const expected = `<html><head><title>test</title></head><body><p>body</p><script src="test.js"></script></body></html>`;
    expect(received).toEqual(expected);
    done();
  });

  test('injectBeforeEndBody without body', (done) => {
    const html = `<html><head><title>test</title></head><p>body</p></html>`;
    const received = injectBeforeEndBody(html, `<script src="test.js"></script>`);
    const expected = `<html><head><title>test</title></head><p>body</p><script src="test.js"></script></html>`;
    expect(received).toEqual(expected);
    done();
  });

  test('injectBeforeEndBody without html', (done) => {
    const html = `<p>body</p>`;
    const received = injectBeforeEndBody(html, `<script src="test.js"></script>`);
    const expected = `<p>body</p><script src="test.js"></script>`;
    expect(received).toEqual(expected);
    done();
  });
});

describe('parse attributes unit tests', () => {
  test('parseAttr without attr', (done) => {
    const source = '<img alt="apple">';
    const received = Template.parseAttr(source, 'src');
    const expected = false;
    expect(received).toEqual(expected);
    done();
  });

  test('parseAttr empty value', (done) => {
    const source = '<img src="">';
    const received = Template.parseAttr(source, 'src');
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
    const received = Template.parseAttr(source, 'src');
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
    expect(received).toEqual(expected);
    done();
  });

  test('parseSrcset multi values', (done) => {
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
    expect(received).toEqual(expected);
    done();
  });
});

describe('resolve parsed values', () => {
  test('https://example.com/style.css', (done) => {
    const received = Template.resolve({ type: 'style', file: 'https://example.com/style.css', issuer: '' });
    const expected = false;
    expect(received).toEqual(expected);
    done();
  });

  test('http://example.com/style.css', (done) => {
    const received = Template.resolve({ type: 'style', file: 'http://example.com/style.css', issuer: '' });
    const expected = false;
    expect(received).toEqual(expected);
    done();
  });

  test('//style.css', (done) => {
    const received = Template.resolve({ type: 'style', file: '//style.css', issuer: '' });
    const expected = false;
    expect(received).toEqual(expected);
    done();
  });

  test('/style.css', (done) => {
    const received = Template.resolve({ type: 'style', file: '/style.css', issuer: '' });
    const expected = false;
    expect(received).toEqual(expected);
    done();
  });
});

describe('parse tags unit tests', () => {
  test('parse single tag img', (done) => {
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
    expect(received).toEqual(expected);
    done();
  });
});

describe('AssetEntry unit tests', () => {
  test('reset', (done) => {
    AssetEntry.compilationEntryNames = new Set(['home', 'about']);
    AssetEntry.reset();
    const received = AssetEntry.compilationEntryNames;
    expect(received).toEqual(new Set());
    done();
  });
});

describe('plugin options unit tests', () => {
  test('isTrue: defaultValue', (done) => {
    const received = Options.toBool(undefined, false, true);
    expect(received).toEqual(true);
    done();
  });

  test('isTrue: value false', (done) => {
    Options.prodMode = true;
    const received = Options.toBool(false, true, true);
    expect(received).toEqual(false);
    done();
  });

  test('isTrue: value true', (done) => {
    Options.prodMode = true;
    const received = Options.toBool(true, false, false);
    expect(received).toEqual(true);
    done();
  });

  test('isTrue: "auto", autoValue = true, prod mode', (done) => {
    Options.prodMode = true;
    const received = Options.toBool('auto', true, false);
    expect(received).toEqual(true);
    done();
  });

  test('isTrue: "auto", autoValue = false, prod mode', (done) => {
    Options.prodMode = true;
    const received = Options.toBool('auto', false, false);
    expect(received).toEqual(false);
    done();
  });

  test('isTrue: "auto", autoValue = true, dev mode', (done) => {
    Options.prodMode = false;
    const received = Options.toBool('auto', true, false);
    expect(received).toEqual(false);
    done();
  });

  test('isTrue: "auto", autoValue = false, dev mode', (done) => {
    Options.prodMode = false;
    const received = Options.toBool('auto', false, false);
    expect(received).toEqual(true);
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

  test('resolve-in-many-pages-from-same-tmpl', (done) => {
    compareFileListAndContent(PATHS, 'resolve-in-many-pages-from-same-tmpl', done);
  });

  test('resolve-in-many-pages-from-one-html', (done) => {
    compareFileListAndContent(PATHS, 'resolve-in-many-pages-from-one-html', done);
  });

  test('resolve-relative-paths', (done) => {
    compareFileListAndContent(PATHS, 'resolve-relative-paths', done);
  });

  test('resolve-alias-in-html', (done) => {
    compareFileListAndContent(PATHS, 'resolve-alias-in-html', done);
  });

  test('resolve svg href with fragment', (done) => {
    compareFileListAndContent(PATHS, 'resolve-svg-use-fragment', done);
  });

  test('resolve svg href with fragment in filename', (done) => {
    compareFileListAndContent(PATHS, 'resolve-svg-use-fragment-filename', done);
  });
});

describe('resolve styles', () => {
  test('resolve styles with same name', (done) => {
    compareFileListAndContent(PATHS, 'resolve-styles-with-same-name', done);
  });

  test('resolve styles loaded from node_modules', (done) => {
    compareFileListAndContent(PATHS, 'resolve-styles-from-module', done);
  });
});

describe('resolve url in style', () => {
  test('resolve the url(image) in CSS', (done) => {
    compareFileListAndContent(PATHS, 'resolve-url-in-css', done);
  });

  test('@import url() in CSS', (done) => {
    compareFileListAndContent(PATHS, 'import-url-in-css', done);
  });

  test('@import url() in SCSS', (done) => {
    compareFileListAndContent(PATHS, 'import-url-in-scss', done);
  });

  test('resolve-url-deep', (done) => {
    compareFileListAndContent(PATHS, 'resolve-url-deep', done);
  });
});

describe('plugin options', () => {
  test('output.publicPath = auto', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-auto', done);
  });

  test('output.publicPath = function', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-function', done);
  });

  test('output.publicPath = ""', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-empty', done);
  });

  test('output.publicPath = "/"', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-root', done);
  });

  test('output.publicPath = "/sub-path/"', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-custom', done);
  });

  test('output.publicPath = "http://localhost:8080/"', (done) => {
    compareFileListAndContent(PATHS, 'option-output-public-path-url', done);
  });

  test('sourcePath and outputPath (default)', (done) => {
    compareFileListAndContent(PATHS, 'option-default-path', done);
  });

  test('sourcePath and outputPath', (done) => {
    compareFileListAndContent(PATHS, 'option-custom-path', done);
  });

  test('filename as function', (done) => {
    compareFileListAndContent(PATHS, 'option-filename-function', done);
  });

  test('js.filename', (done) => {
    compareFileListAndContent(PATHS, 'option-js-filename', done);
  });

  test('js and css outputPath absolute', (done) => {
    compareFileListAndContent(PATHS, 'option-js-css-outputPath-absolute', done);
  });

  test('js and css outputPath relative', (done) => {
    compareFileListAndContent(PATHS, 'option-js-css-outputPath-relative', done);
  });

  test('css.inline auto, dev', (done) => {
    compareFileListAndContent(PATHS, 'option-css-inline-auto-dev', done);
  });

  test('css.inline auto, prod', (done) => {
    compareFileListAndContent(PATHS, 'option-css-inline-auto-prod', done);
  });

  test('js.inline auto, dev', (done) => {
    compareFileListAndContent(PATHS, 'option-js-inline-auto-dev', done);
  });

  test('js.inline auto, prod', (done) => {
    compareFileListAndContent(PATHS, 'option-js-inline-auto-prod', done);
  });

  test('verbose', (done) => {
    compareFileListAndContent(PATHS, 'option-verbose', done);
  });

  test('verbose output', (done) => {
    stdoutContain(PATHS, 'option-verbose-output', done);
  });

  test('extractComments = false', (done) => {
    compareFileListAndContent(PATHS, 'option-extract-comments-false', done);
  });

  test('extractComments = true', (done) => {
    compareFileListAndContent(PATHS, 'option-extract-comments-true', done);
  });

  test('postprocess', (done) => {
    compareFileListAndContent(PATHS, 'option-postprocess', done);
  });

  test('afterProcess', (done) => {
    compareFileListAndContent(PATHS, 'option-afterProcess', done);
  });

  test('entry', (done) => {
    compareFileListAndContent(PATHS, 'option-entry', done);
  });

  test('entry data file', (done) => {
    compareFileListAndContent(PATHS, 'option-entry-data-file', done);
  });

  test('entry path', (done) => {
    compareFileListAndContent(PATHS, 'option-entry-path', done);
  });

  test('preload', (done) => {
    compareFileListAndContent(PATHS, 'option-preload', done);
  });

  test('preload with responsive images', (done) => {
    compareFileListAndContent(PATHS, 'option-preload-responsive-images', done);
  });

  test('preload with split chunk', (done) => {
    compareFileListAndContent(PATHS, 'option-preload-split-chunk', done);
  });
});

describe('plugin minify option', () => {
  test('minify HTML', (done) => {
    compareFileListAndContent(PATHS, 'option-minify', done);
  });

  test('minify HTML with custom options', (done) => {
    compareFileListAndContent(PATHS, 'option-minify-options', done);
  });

  test('minify auto prod', (done) => {
    compareFileListAndContent(PATHS, 'option-minify-auto-prod', done);
  });

  test('minify auto dev', (done) => {
    compareFileListAndContent(PATHS, 'option-minify-auto-dev', done);
  });

  test('minify auto options', (done) => {
    compareFileListAndContent(PATHS, 'option-minify-auto-options', done);
  });

  // minify parse error when used the "<" char in text
  // https://github.com/terser/html-minifier-terser/issues/28
  // test('minify HTML with "<" char', (done) => {
  //   compareFileListAndContent(PATHS, 'option-minify-html-chars', done);
  // });
});

describe('option watchFiles', () => {
  test('watchFiles.paths', (done) => {
    watchStdoutContain(PATHS, 'option-watchFiles-paths', done);
  });

  test('watchFiles.files', (done) => {
    watchStdoutContain(PATHS, 'option-watchFiles-files', done);
  });

  test('watchFiles.ignore', (done) => {
    watchStdoutContain(PATHS, 'option-watchFiles-ignore', done);
  });
});

describe('loader options', () => {
  test('defaults option when in module.rules is not defined', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-defaults', done);
  });

  test('disable the processing of all tags and attributes', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-sources-false', done);
  });

  test('add custom tags and attributes', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-sources-attrs', done);
  });

  test('filter tags and attributes', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-sources-attrs-filter', done);
  });

  test('filter property attribute', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-sources-attrs-filter-property', done);
  });

  test('preprocessor by defaults', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-default', done);
  });

  test('preprocessor disabled', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-disabled', done);
  });

  test('preprocessor return null', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-return-null', done);
  });

  test('root', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-root', done);
  });
});

describe('loader options for templating', () => {
  test('loader data', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-data', done);
  });

  test('loader data file', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-data-file', done);
  });

  test('preprocessor Eta', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-eta', done);
  });

  test('preprocessor Eta async', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-eta-async', done);
  });

  test('preprocessor EJS', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-ejs', done);
  });

  test('preprocessor EJS async', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-ejs-async', done);
  });

  test('preprocessor EJS as string', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-ejs-string', done);
  });

  test('preprocessor handlebars', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-handlebars', done);
  });

  test('preprocessor handlebars: register helper functions', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-handlebars-helpers', done);
  });

  test('preprocessor handlebars: register helpers from path', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-handlebars-helpers-path', done);
  });

  test('preprocessor handlebars: register partials', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-handlebars-partials', done);
  });

  test('preprocessor handlebars: register partials from paths', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-handlebars-partials-path', done);
  });

  test('preprocessor Mustache', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-mustache', done);
  });

  test('preprocessor for simple multipage', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-multipage', done);
  });

  test('preprocessor for multipage with nunjucks', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-nunjucks-multipage', done);
  });

  test('preprocessor for multipage with nunjucks async', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-nunjucks-async-multipage', done);
  });

  test('preprocessor liquid', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-liquid', done);
  });

  test('preprocessor liquid async', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-liquid-async', done);
  });

  test('preprocessor with multiple templating engines', (done) => {
    compareFileListAndContent(PATHS, 'loader-option-preprocessor-many-ejs-hbs', done);
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

  test('inline-asset-source-svg', (done) => {
    compareFileListAndContent(PATHS, 'inline-asset-source-svg', done);
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

  test('inline script using when used runtimeChunk:single', (done) => {
    compareFileListAndContent(PATHS, 'inline-script-runtimeChunk-single', done);
  });

  test('inline js and css with minify', (done) => {
    compareFileListAndContent(PATHS, 'inline-js-css-with-minify', done);
  });
});

describe('split chunks', () => {
  test('extract css and js w/o runtime code of css-loader', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-css-js', done);
  });

  test('import source scripts and styles from many node module', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-node-module-many-vendors', done);
  });

  test('import source scripts and styles from node module', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-node-module-source', done);
  });

  test('resolve assets when used split chunk, development', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-resolve-assets-dev', done);
  });

  test('resolve assets when used split chunk, production', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-resolve-assets-prod', done);
  });

  test('load vendor scripts from node module', (done) => {
    compareFileListAndContent(PATHS, 'split-chunk-vendor', done);
  });
});

describe('special cases', () => {
  test('resolve values with invalid syntax', (done) => {
    compareFileListAndContent(PATHS, 'resolve-values-invalid-syntax', done);
  });

  test('resolve assets without extension', (done) => {
    compareFileListAndContent(PATHS, 'resolve-assets-without-ext', done);
  });

  test('resolve assets in entries with a query', (done) => {
    compareFileListAndContent(PATHS, 'resolve-in-entry-with-query', done);
  });

  test('resolve manifest.json', (done) => {
    compareFileListAndContent(PATHS, 'resolve-manifest.json', done);
  });

  test('Template with CRLF line separator', (done) => {
    compareFileListAndContent(PATHS, 'template-clrf', done);
  });

  test('encode / decode reserved HTML chars', (done) => {
    compareFileListAndContent(PATHS, 'decode-chars', done);
  });

  test('preprocessor for output php template', (done) => {
    compareFileListAndContent(PATHS, 'preprocessor-php', done);
  });

  test('resolve preloaded script and style', (done) => {
    compareFileListAndContent(PATHS, 'resolve-preload-script-style', done);
  });

  test('preload, no head', (done) => {
    compareFileListAndContent(PATHS, 'preload-no-head', done);
  });

  test('preload, no head closing tag', (done) => {
    compareFileListAndContent(PATHS, 'preload-no-head-close', done);
  });

  // for debugging
  // test('resolve hmr file', (done) => {
  //   watchCompareFileListAndContent(PATHS, 'resolve-hmr-file', done);
  // });
});

describe('extras: responsive images', () => {
  test('responsive images in template, publicPath="auto"', (done) => {
    compareFileListAndContent(PATHS, 'responsive-images', done);
  });

  test('responsive images in template, publicPath="/"', (done) => {
    compareFileListAndContent(PATHS, 'responsive-images-publicPath-root', done);
  });

  test('require images in template and in style', (done) => {
    compareFileListAndContent(PATHS, 'responsive-images-html-scss', done);
  });

  test('require many duplicate images in template and styles', (done) => {
    compareFileListAndContent(PATHS, 'responsive-images-many-duplicates', done);
  });
});

describe('use template in js', () => {
  test('require default template in js', (done) => {
    compareFileListAndContent(PATHS, 'require-tmpl-in-js', done);
  });
});

// Test Messages

describe('loader exceptions', () => {
  test('exception sync preprocessor', () => {
    const containString = 'Preprocessor failed';
    return exceptionContain(PATHS, 'msg-exception-loader-preprocessor', containString);
  });

  test('exception unsupported preprocessor value', () => {
    const containString = 'Unsupported preprocessor';
    return exceptionContain(PATHS, 'msg-exception-loader-preprocessor-unsupported', containString);
  });

  test('exception async preprocessor', () => {
    const containString = 'Preprocessor failed';
    return exceptionContain(PATHS, 'msg-exception-loader-preprocessor-async', containString);
  });

  test('exception compile: missing the closing', () => {
    const containString = `missing the closing '>' char`;
    return exceptionContain(PATHS, 'msg-exception-loader-compile-close-tag', containString);
  });

  test('exception compile: missing the closing at eof', () => {
    const containString = `missing the closing '>' char`;
    return exceptionContain(PATHS, 'msg-exception-loader-compile-close-tag-eof', containString);
  });

  test('exception compile: resolve file', () => {
    const containString = `can't be resolved in the template`;
    return exceptionContain(PATHS, 'msg-exception-loader-resolve-file', containString);
  });

  test('exception: resolve required file', () => {
    const containString = `Can't resolve the file`;
    return exceptionContain(PATHS, 'msg-exception-resolve-file', containString);
  });

  test('exception export', () => {
    const containString = 'Export of compiled template failed';
    return exceptionContain(PATHS, 'msg-exception-loader-export', containString);
  });

  test('exception: loader used without the plugin', () => {
    const containString = 'Illegal usage of the loader';
    return exceptionContain(PATHS, 'msg-exception-loader-no-plugin', containString);
  });

  test('exception: handlebars include file not found', () => {
    const containString = 'Could not find the include file';
    return exceptionContain(PATHS, 'msg-exception-handlebars-include', containString);
  });

  test('exception: handlebars partial file not found', () => {
    const containString = 'Could not find the partial';
    return exceptionContain(PATHS, 'msg-exception-handlebars-partial', containString);
  });

  test('exception: loader data file not found', () => {
    const containString = `The data file not found`;
    return exceptionContain(PATHS, 'msg-exception-loader-data-file-not-found', containString);
  });

  test('exception: loader data file is invalid', () => {
    const containString = `Load the data file failed`;
    return exceptionContain(PATHS, 'msg-exception-loader-data-file-invalid', containString);
  });

  test('exception preprocessor: load module', (done) => {
    const containString = 'Cannot find module';
    try {
      loadModule('not-exists-module');
      throw new Error('the test should throw an error');
    } catch (error) {
      expect(error.toString()).toContain(containString);
      done();
    }
  });
});

describe('watch exceptions', () => {
  test('watchFiles.paths: dir not found', (done) => {
    const containString = `The watch directory not found`;
    watchExceptionContain(PATHS, 'msg-exception-plugin-option-watchFiles-paths', containString, done);
  });
});

describe('plugin exceptions', () => {
  test('@import CSS is not supported', () => {
    const containString = `Disable the 'import' option in 'css-loader'`;
    return exceptionContain(PATHS, 'msg-exception-plugin-import-css-rule', containString);
  });

  test('entry directory not found', () => {
    const containString = 'The directory is invalid or not found';
    return exceptionContain(PATHS, 'msg-exception-option-entry-dir-not-found', containString);
  });

  test('entry is not directory', () => {
    const containString = 'The directory is invalid or not found';
    return exceptionContain(PATHS, 'msg-exception-option-entry-not-dir', containString);
  });

  test('option modules', () => {
    const containString = 'must be the array of';
    return exceptionContain(PATHS, 'msg-exception-plugin-option-modules', containString);
  });

  test('execute postprocess', () => {
    const containString = 'Postprocess failed';
    return exceptionContain(PATHS, 'msg-exception-plugin-execute-postprocess', containString);
  });

  test('multiple chunks with same filename', () => {
    const containString = 'Multiple chunks emit assets to the same filename';
    return exceptionContain(PATHS, 'msg-exception-plugin-multiple-chunks-same-filename', containString);
  });

  test('fail resolving asset without loader', () => {
    const containString = `Module parse failed: Unexpected character`;
    return exceptionContain(PATHS, 'msg-exception-plugin-resolve-asset', containString);
  });

  // TODO: catch the fatal error: processTicksAndRejections (node:internal/process/task_queues:95:5)

  // test it manual only, because Jest fail
  // test('preload invalid option', () => {
  //   const containString = `Missing the 'as' property in a configuration object of the plugin option preload`;
  //   return exceptionContain(PATHS, 'msg-exception-plugin-option-preload-as', containString);
  // });

  // test it manual only, because Jest fail
  // test('option afterProcess', () => {
  //   const containString = 'Custom after process failed';
  //   return exceptionContain(PATHS, 'msg-exception-plugin-option-afterProcess', containString);
  // });
});
