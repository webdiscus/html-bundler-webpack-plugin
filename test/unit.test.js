import fs from 'fs';
import { findPlugin, getFileExtension, replaceAll } from '../src/Common/Helpers';
import { isDir, loadModule, resolveFile, filterParentPaths } from '../src/Common/FileUtils';
import AssetEntry from '../src/Plugin/AssetEntry';
import Asset from '../src/Plugin/Asset';
import Snapshot from '../src/Plugin/Snapshot';
import Template from '../src/Loader/Template';
import { HtmlParser } from '../src/Common/HtmlParser';
import { injectBeforeEndHead, injectBeforeEndBody } from '../src/Loader/Utils';
import Option from '../src/Plugin/Option';
import Collection from '../src/Plugin/Collection';

beforeAll(() => {
  // important: the environment constant is used in code
  process.env.NODE_ENV_TEST = 'true';
});

describe('unique filename tests', () => {
  test('js/file.js', () => {
    const received = Asset.getUniqueFilename('/src/file.js', 'js/file.js');
    const expected = 'js/file.js';
    Asset.reset();
    return expect(received.filename).toStrictEqual(expected);
  });

  test('js/file.1 w/o ext', () => {
    Asset.index = {
      'js/file': 1,
    };
    const received = Asset.getUniqueFilename('/src/file.js', 'js/file');
    const expected = 'js/file.1';
    Asset.reset();
    return expect(received.filename).toStrictEqual(expected);
  });

  test('js/file.1.js', () => {
    Asset.index = {
      'js/file.js': 1,
    };
    const received = Asset.getUniqueFilename('/src/file.js', 'js/file.js');
    const expected = 'js/file.1.js';
    Asset.reset();
    return expect(received.filename).toStrictEqual(expected);
  });

  test('file.a1b2c3d4.1.js', () => {
    Asset.index = {
      'js/file.a1b2c3d4.js': 1,
    };
    const received = Asset.getUniqueFilename('/src/file.js', 'js/file.a1b2c3d4.js');
    const expected = 'js/file.a1b2c3d4.1.js';
    Asset.reset();
    return expect(received.filename).toStrictEqual(expected);
  });

  test('file.1.a1b2c3d4.js cache', () => {
    Asset.files = new Map([
      ['/src/file.css', 'css/file.a1b2c3d4.css'],
      ['/src/file.js', 'js/file.1.a1b2c3d4.js'], // <= already cached by source filename
    ]);

    const received = Asset.getUniqueFilename('/src/file.js', 'js/file.a1b2c3d4.js');
    const expected = 'js/file.1.a1b2c3d4.js';
    Asset.reset();
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
    const received = HtmlParser.parseAttr(source, 'src');
    const expected = false;
    return expect(received).toEqual(expected);
  });

  test('parseAttr empty value', () => {
    const source = '<img src="">';
    const received = HtmlParser.parseAttr(source, 'src', 'asset');
    const expected = {
      type: 'asset',
      attr: 'src',
      startPos: 10,
      endPos: 10,
      inEscapedDoubleQuotes: false,
      offset: 0,
      value: '',
      parsedValue: [''],
    };
    return expect(received).toEqual(expected);
  });

  test('parseAttr value', () => {
    const source = '<img src="img1.png?size=800" srcset="img1.png, img2.png 100w, img3.png 1.5x">';
    const received = HtmlParser.parseAttr(source, 'src', 'asset', 0);
    const expected = {
      type: 'asset',
      attr: 'src',
      startPos: 10,
      endPos: 27,
      inEscapedDoubleQuotes: false,
      offset: 0,
      value: 'img1.png?size=800',
      parsedValue: ['img1.png'],
    };
    return expect(received).toEqual(expected);
  });

  test('parseSrcset single value', () => {
    const source = '<source srcset="img1.png?size=200 w200">';
    const received = HtmlParser.parseAttr(source, 'srcset', 'asset');
    const expected = {
      attr: 'srcset',
      startPos: 16,
      endPos: 38,
      inEscapedDoubleQuotes: false,
      offset: 0,
      value: 'img1.png?size=200 w200',
      parsedValue: ['img1.png'],
      attrs: [
        {
          type: 'asset',
          attr: 'srcset',
          // TODO: test with a plugin which resizes images via a query param
          value: 'img1.png?size=200',
          startPos: 16,
          endPos: 33,
          inEscapedDoubleQuotes: false,
          offset: 0,
        },
      ],
    };
    return expect(received).toEqual(expected);
  });

  test('parseSrcset multi values', () => {
    const source = '<img src="img1.png" srcset="img1.png, img2.png 100w, img3.png 1.5x">';
    const received = HtmlParser.parseAttr(source, 'srcset');
    const expected = {
      attr: 'srcset',
      startPos: 28,
      endPos: 66,
      inEscapedDoubleQuotes: false,
      offset: 0,
      value: 'img1.png, img2.png 100w, img3.png 1.5x',
      parsedValue: ['img1.png', 'img2.png', 'img3.png'],
      attrs: [
        {
          type: 'asset',
          attr: 'srcset',
          startPos: 28,
          endPos: 36,
          inEscapedDoubleQuotes: false,
          offset: 0,
          value: 'img1.png',
        },
        {
          type: 'asset',
          attr: 'srcset',
          startPos: 38,
          endPos: 46,
          inEscapedDoubleQuotes: false,
          offset: 0,
          value: 'img2.png',
        },
        {
          type: 'asset',
          attr: 'srcset',
          startPos: 53,
          endPos: 61,
          inEscapedDoubleQuotes: false,
          offset: 0,
          value: 'img3.png',
        },
      ],
    };
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

describe('parse tags unit tests', () => {
  test('single tag img', () => {
    const html = `<img src="img1.png" alt="logo">`;
    const received = HtmlParser.parseTag(html, { tag: 'img', attributes: ['src'] });
    const expected = [
      {
        tag: 'img',
        source: '<img src="img1.png" alt="logo">',
        type: 'asset',
        startPos: 0,
        endPos: 31,
        parsedAttrs: [
          {
            type: 'asset',
            attr: 'src',
            value: 'img1.png',
            parsedValue: ['img1.png'],
            startPos: 10,
            endPos: 18,
            inEscapedDoubleQuotes: false,
            offset: 0,
          },
        ],
        attrs: null,
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
        tag: 'img',
        source: '<img src="img1.png" alt="logo" srcset="1.png?s=200 200w, 2.png">',
        type: 'asset',
        startPos: 5,
        endPos: 69,
        parsedAttrs: [
          {
            type: 'asset',
            attr: 'src',
            value: 'img1.png',
            parsedValue: ['img1.png'],
            startPos: 10,
            endPos: 18,
            inEscapedDoubleQuotes: false,
            offset: 5,
          },
          {
            type: 'asset',
            attr: 'srcset',
            value: '1.png?s=200',
            startPos: 39,
            endPos: 50,
            inEscapedDoubleQuotes: false,
            offset: 5,
          },
          {
            type: 'asset',
            attr: 'srcset',
            value: '2.png',
            startPos: 57,
            endPos: 62,
            inEscapedDoubleQuotes: false,
            offset: 5,
          },
        ],
        attrs: null,
      },
    ];
    return expect(received).toEqual(expected);
  });
});

describe('escaped quote', () => {
  test('parseAttrAll: escaped quote', () => {
    const html = `<img src=\\"img1.png\\" alt=\\"logo\\">`;
    const received = HtmlParser.parseAttrAll(html);
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
        source: `<img src=\\"img1.png\\" alt=\\"logo\\">`,
        type: 'asset',
        startPos: 0,
        endPos: 35,
        parsedAttrs: [
          {
            type: 'asset',
            attr: 'src',
            value: 'img1.png',
            parsedValue: ['img1.png'],
            startPos: 11,
            endPos: 19,
            inEscapedDoubleQuotes: true,
            offset: 0,
          },
        ],
        attrs: null,
      },
    ];
    return expect(received).toEqual(expected);
  });
});

describe('parseAttrAll', () => {
  test('tag end 01', () => {
    const source = '<script src="file.js">';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { src: 'file.js' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 02', () => {
    const source = '<script src="file.js" >';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { src: 'file.js' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 03', () => {
    const source = '<script defer=true>';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { defer: 'true' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 04', () => {
    const source = '<script defer=true/>';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { defer: 'true' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 05', () => {
    const source = '<script defer=true >';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { defer: 'true' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 06', () => {
    const source = '<script defer>';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { defer: undefined };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 07', () => {
    const source = '<script defer/>';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { defer: undefined };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 08', () => {
    const source = '<script defer >';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { defer: undefined };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 11', () => {
    const source = '<script src="file.js"/>';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { src: 'file.js' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 12', () => {
    const source = '<script src="file.js"  />';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { src: 'file.js' };
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 31', () => {
    const source = '<br>';
    const received = HtmlParser.parseAttrAll(source);
    const expected = {};
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 32', () => {
    const source = '<br/>';
    const received = HtmlParser.parseAttrAll(source);
    const expected = {};
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 33', () => {
    const source = '<br />';
    const received = HtmlParser.parseAttrAll(source);
    const expected = {};
    return expect(received).toStrictEqual(expected);
  });

  test('tag end 34', () => {
    const source = '<br attr />';
    const received = HtmlParser.parseAttrAll(source);
    const expected = { attr: undefined };
    return expect(received).toStrictEqual(expected);
  });

  test('all possible values of attribute', () => {
    const source = `<script  defer data-text="text with spaces"  enabled=true empty="" src='file.js'  />`;
    const received = HtmlParser.parseAttrAll(source);
    const expected = { defer: undefined, 'data-text': 'text with spaces', enabled: 'true', empty: '', src: 'file.js' };
    return expect(received).toStrictEqual(expected);
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
    const received = Option.toBool(undefined, false, true);
    return expect(received).toEqual(true);
  });

  test('isTrue: value false', () => {
    Option.productionMode = true;
    const received = Option.toBool(false, true, true);
    return expect(received).toEqual(false);
  });

  test('isTrue: value true', () => {
    Option.productionMode = true;
    const received = Option.toBool(true, false, false);
    return expect(received).toEqual(true);
  });

  test('isTrue: "auto", autoValue = true, prod mode', () => {
    Option.productionMode = true;
    const received = Option.toBool('auto', true, false);
    return expect(received).toEqual(true);
  });

  test('isTrue: "auto", autoValue = false, prod mode', () => {
    Option.productionMode = true;
    const received = Option.toBool('auto', false, false);
    return expect(received).toEqual(false);
  });

  test('isTrue: "auto", autoValue = true, dev mode', () => {
    Option.productionMode = false;
    const received = Option.toBool('auto', true, false);
    return expect(received).toEqual(false);
  });

  test('isTrue: "auto", autoValue = false, dev mode', () => {
    Option.productionMode = false;
    const received = Option.toBool('auto', false, false);
    return expect(received).toEqual(true);
  });

  test('isProduction true', () => {
    Option.productionMode = true;
    const received = Option.isProduction();
    return expect(received).toEqual(true);
  });

  test('isRealContentHash true', () => {
    Option.webpackOptions.optimization = {
      realContentHash: true,
    };
    const received = Option.isRealContentHash();
    return expect(received).toEqual(true);
  });

  test('isScript true', () => {
    Option.options = {
      js: {
        enabled: true,
        test: Option.js.test,
      },
    };

    const received = Option.isScript('test.js?v=123');
    return expect(received).toEqual(true);
  });

  test('getEntryPath', () => {
    Option.dynamicEntry = 'src/views/';
    Option.options.entry = Option.dynamicEntry;

    const received = Option.getEntryPath();
    return expect(received).toEqual(Option.dynamicEntry);
  });
});

describe('FileUtils', () => {
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

  test('replaceAll', () => {
    const received = replaceAll('begin replace_me and replace_me and', 'replace_me', 'A');
    const expected = 'begin A and A and';
    return expect(received).toEqual(expected);
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
    const received = Collection.findStyleInsertPos(content);
    const expected = 12;
    return expect(received).toEqual(expected);
  });

  test('Collection.findStyleInsertPos OK before script', () => {
    const content = `<html><head><link><script></script></head><body></body></html>`;
    const received = Collection.findStyleInsertPos(content);
    const expected = 18;
    return expect(received).toEqual(expected);
  });

  test('Collection.findStyleInsertPos no open head', () => {
    const content = `<html></head><body></body></html>`;
    const received = Collection.findStyleInsertPos(content);
    const expected = -1;
    return expect(received).toEqual(expected);
  });

  test('Collection.findStyleInsertPos no close head', () => {
    const content = `<html><head><body></body></html>`;
    const received = Collection.findStyleInsertPos(content);
    const expected = -1;
    return expect(received).toEqual(expected);
  });
});
