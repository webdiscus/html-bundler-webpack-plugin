import { compareFiles, exceptionContain, watchCompareFiles } from './utils/helpers';
import { filterLoadException } from '../src/Loader/Preprocessors/Pug/Exeptions';

import FugFilter from '../src/Loader/Preprocessors/Pug/Filter';

// TODO: add in docs
// BRAKING CHANGE (to compare with pug-loader)
// The inlined loader in URL is no longer supported because it is an ugly/terrible usage syntax:
// const tmpl = require('pug-loader!./src/partial.pug');

beforeAll(() => {
  // important: the environment constant is used in code
  // the value must be type string
  process.env.NODE_ENV_TEST = 'true';
});

describe('simple tests', () => {
  test('Hello World!', () => compareFiles('_pug/hello-world'));
  test('hello-world-app', () => compareFiles('_pug/hello-world-app'));
  test('inline-code-minify', () => compareFiles('_pug/inline-code-minify'));
  test('escape special chars, compile', () => compareFiles('_pug/escape-mode-compile'));
  test('escape special chars, render', () => compareFiles('_pug/escape-mode-render'));
});

describe('special cases', () => {
  test('resolve js, css in multiple pages', () => compareFiles('_pug/resolve-js-css-multipage'));
});

describe('extend / include / raw include', () => {
  test('resolve extends alias', () => compareFiles('_pug/extends-alias'));
  test('resolve extends relative', () => compareFiles('_pug/extends-relative'));
  test('resolve include, resolve.alias', () => compareFiles('_pug/include-alias-resolve.alias'));
  test('resolve include, resolve.plugins', () => compareFiles('_pug/include-alias-resolve.plugins'));
  test('resolve include alias, compile', () => compareFiles('_pug/include-alias-resolve.plugins-compile'));
  test('resolve include alias, render', () => compareFiles('_pug/include-alias-resolve.plugins-render'));
  test('resolve include relative', () => compareFiles('_pug/include-relative'));
  test('resolve include relative, using variables', () => compareFiles('_pug/include-relative-vars'));
  test('resolve relative path for extends/include', () => compareFiles('_pug/include-extends-relative'));
  test('resolve include script alias', () => compareFiles('_pug/include-script-alias'));
  test('resolve include script relative', () => compareFiles('_pug/include-script-relative'));
  test('resolve include alias file', () => compareFiles('_pug/include-alias-file'));
});

describe('require code', () => {
  test('require json via alias', () => compareFiles('_pug/require-json-alias'));
  test('require json relative', () => compareFiles('_pug/require-json-relative'));
  test('require js module relative', () => compareFiles('_pug/require-js-relative'));
});

describe('resolve assets with require', () => {
  test('img attributes', () => compareFiles('_pug/resolve-img-attributes'));
  test('img attributes, require', () => compareFiles('_pug/resolve-img-attributes-require'));

  test('require-in-all-pug-references', () => compareFiles('_pug/require-in-all-pug-references'));
  test('require-alias-array-compile', () => compareFiles('_pug/require-alias-array-compile'));
  test('require-alias-array-render', () => compareFiles('_pug/require-alias-array-render'));
  test('require-fonts', () => compareFiles('_pug/require-fonts'));
  test('require-img-srcset', () => compareFiles('_pug/require-img-srcset'));
  // TODO: this case doesn't works, responsive images used in template which is imported in JS must be passed as variables resolved via import in JS
  //test('require-responsive-img-query-compile', () => compareFiles('_pug/require-img-query-compile'));
  test('require-responsive-img-query-render', () => compareFiles('_pug/require-img-query-render'));
  test('require-string', () => compareFiles('_pug/require-resource-string'));
  test('require-alias', () => compareFiles('_pug/require-resource-alias'));
  test('require-node-module', () => compareFiles('_pug/require-node-module'));
  test('require-include-mixin-compile', () => compareFiles('_pug/require-resource-include-mixin-compile'));
  test('require-include-mixin-render', () => compareFiles('_pug/require-resource-include-mixin-render'));
  test('require-variable-current-dir', () => compareFiles('_pug/require-resource-variable-current-dir'));
  test('require-variable-parent-dir', () => compareFiles('_pug/require-resource-variable-parent-dir'));
  test('require-variable-sub-dir', () => compareFiles('_pug/require-resource-variable-sub-dir'));
  test('require-assets-compile', () => compareFiles('_pug/require-assets-compile'));
  test('require-assets-compile-esm', () => compareFiles('_pug/require-assets-compile-esm'));
  test('require-assets-render', () => compareFiles('_pug/require-assets-render'));
  test('require-resource-in-mixin-argument', () => compareFiles('_pug/require-resource-in-mixin-argument'));
  test('require svg fragment', () => compareFiles('_pug/require-img-svg-fragment'));
});

describe('resolve assets in attrs', () => {
  test('resolve images', () => compareFiles('_pug/resolve-attr-images'));
  test('resolve styles', () => compareFiles('_pug/resolve-attr-styles'));
});

describe('resolve scripts', () => {
  test('script tags', () => compareFiles('_pug/require-script-tags'));
  test('resolve path in resolve.modules', () => compareFiles('_pug/resolve-path'));
});

describe('require pug in javascript', () => {
  test(`js import pug, require assets, compile`, () => compareFiles('_pug/js-tmpl-resolve-assets-compile'));
  test(`js import pug, require assets, render`, () => compareFiles('_pug/js-tmpl-resolve-assets-render'));
  test(`js import pug with data, compile`, () => compareFiles('_pug/js-tmpl-data-external-compile'));
  test(`js import pug with data, render`, () => compareFiles('_pug/js-tmpl-data-external-render'));
});

describe('options tests', () => {
  test('basedir', () => compareFiles('_pug/loader-option-basedir'));
  test('doctype html5', () => compareFiles('_pug/loader-option-doctype-html5'));
  test(`default mode in js`, () => compareFiles('_pug/js-tmpl-default'));
  test(`render mode in js`, () => compareFiles('_pug/js-tmpl-render'));
  test(`mix modes in js: default with render`, () => compareFiles('_pug/js-tmpl-data-query-render'));
  test(`name`, () => compareFiles('_pug/loader-option-name'));
  test(`loader option: esModule=false`, () => compareFiles('_pug/loader-option-esModule-false'));
  test(`loader option: esModule=true`, () => compareFiles('_pug/loader-option-esModule-true'));
});

describe('option data', () => {
  test('pass global data', () => compareFiles('_pug/loader-option-data'));
  test('pass page data', () => compareFiles('_pug/loader-option-data-mulipage'));
  test(`using self option`, () => compareFiles('_pug/loader-option-data-self'));
});

describe('embedded filters tests', () => {
  test(`:escape`, () => compareFiles('_pug/filter-escape'));
  test(`:code`, () => compareFiles('_pug/filter-code'));
  test(`:code include files`, () => compareFiles('_pug/filter-code-include-files'));
  test(`:highlight`, () => compareFiles('_pug/filter-highlight'));
  test(`:markdown`, () => compareFiles('_pug/filter-markdown'));
});

describe('exceptions', () => {
  test('exception: filter not found', () => {
    const containString = `The 'embedFilters' option contains unknown filter:`;
    return exceptionContain('_pug/msg-exception-filter-not-found', containString);
  });

  test('exception: by load a filter', (done) => {
    const expected = `Error by load`;
    const result = () => {
      filterLoadException('filter', '/path/', new Error('module not found'));
    };
    expect(result).toThrow(expected);
    done();
  });

  test('exception 1: by load peer dependency for a filter', (done) => {
    const expected = /The required (.+?) module not found/;

    const result = () => {
      FugFilter.loadModuleException({
        error: new Error(`Cannot find module 'parse5'\n`),
        filterName: 'highlight',
      });
    };
    expect(result).toThrow(expected);
    done();
  });

  test('exception 2: by load peer dependency for a filter', (done) => {
    const expected = /Error by load the (.+?) filter/;

    const result = () => {
      FugFilter.loadModuleException({
        error: new Error(`Other exception`),
        filterName: 'highlight',
      });
    };
    expect(result).toThrow(expected);
    done();
  });

  test('exception: filter :highlight - unsupported module', () => {
    const filterHighlight = require('../src/Loader/PreprocessorFilters/highlight');
    const adapterHighlight = require('../src/Loader/PreprocessorFilters/highlight/adapter');
    // reset cached module
    adapterHighlight.module = null;
    filterHighlight.module = null;

    const containString = `Used unsupported module`;
    return exceptionContain('_pug/msg-exception-filter-highlight-unsupported-module', containString);
  });

  test('exception: filter :highlight adapter - unsupported module', (done) => {
    const adapterHighlight = require('../src/Loader/PreprocessorFilters/highlight/adapter');
    // reset cached module
    adapterHighlight.module = null;

    const expected = `Used unsupported module`;
    const result = () => {
      adapterHighlight.init({ use: 'unsupported-module' });
    };
    expect(result).toThrow(expected);
    done();
  });
});

// pug-plugin tests

describe('pug-plugin tests', () => {
  // TODO: add pretty option
  //test('options.pretty', () => compareFiles('_pug/option-pretty'));
  // TODO: Pug - OK / HTML - fix issue (see webpack config)
  test('entry: use styles in entry with same', () => compareFiles('_pug/entry-sass-same-names'));
  test('entry: html, pug', () => compareFiles('_pug/entry-html-pug'));

  test('pass data via query', () => compareFiles('_pug/data-entry-query'));
  test('resolve assets in required data', () => compareFiles('_pug/resolve-assets-require-data'));
  test('entry: keep output folder structure', () => compareFiles('_pug/entry-keep-output-dir'));

  // root context
  test('resolve same image in template and scss', () => compareFiles('_pug/resolve-context-image-pug-scss'));
  test('resolve script with auto publicPath', () => compareFiles('_pug/resolve-context-script'));
  test('resolve script with and w/o extension', () => compareFiles('_pug/resolve-context-script-ext'));

  // resolve assets
  test('resolve images, require', () => compareFiles('_pug/resolve-img-require'));
  test('resolve images variable, require', () => compareFiles('_pug/resolve-img-require-variable'));
  //- TODO: ignore/resolve source files via filter
  test('resolve/ignore source files using filter', () => compareFiles('_pug/resolve-assets-source-filter'));

  // special cases
  test('resolve manifest.json via require', () => compareFiles('_pug/resolve-manifest.json-require'));

  // TODO: fix github action issue
  test('compile template function in js', () => compareFiles('_pug/js-tmpl-entry-js'));

  test('inline js and css via query `?inline`', () => compareFiles('_pug/inline-js-css-query'));

  test('inline CSS in style tag with attributes', () => compareFiles('_pug/inline-css-in-style-tag'));

  // resolve responsive images
  test('responsive images in template', () => compareFiles('_pug/responsive-images'));
  test('require images in pug and in style', () => compareFiles('_pug/responsive-images-tmpl-scss'));
});

// TODO: implement detection of duplicates for script and styles in entry
// describe('warning tests', () => {
//   test('duplicate scripts', () => {
//     const containString = 'Duplicate scripts are not allowed';
//     return stdoutContain('_pug/msg-warning-duplicate-scripts', containString);
//   });
//
//   test('duplicate scripts using alias', () => {
//     const containString = 'Duplicate scripts are not allowed';
//     return stdoutContain('_pug/msg-warning-duplicate-scripts-alias', containString);
//   });
//
//   test('duplicate styles', () => {
//     const containString = 'Duplicate styles are not allowed';
//     return stdoutContain('_pug/msg-warning-duplicate-styles', containString);
//   });
// });
