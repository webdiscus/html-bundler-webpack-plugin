import { compareFiles, exceptionContain, watchCompareFiles } from './utils/helpers';
import { filterLoadException } from '../src/Loader/Preprocessors/Pug/Exeptions';

// TODO: add in docs
// BRAKING CHANGE (to compare with pug-loader)
// The inlined loader in URL is no longer supported because it is an ugly/terrible usage syntax:
// const tmpl = require('pug-loader!./src/partial.pug');

beforeAll(() => {
  // important: the environment constant is used in code
  process.env.NODE_ENV_TEST = 'true';
});

describe('simple tests', () => {
  test('Hello World!', () => compareFiles('_pug/hello-world'));
  test('hello-world-app', () => compareFiles('_pug/hello-world-app'));
  test('inline-code-minify', () => compareFiles('_pug/inline-code-minify'));
  test('escape special chars, compile', () => compareFiles('_pug/escape-mode-compile'));
  test('escape special chars, render', () => compareFiles('_pug/escape-mode-render'));
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

describe('resolve assets', () => {
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
  test('require-assets-method-compile', () => compareFiles('_pug/require-assets-method-compile'));
  test('require-assets-method-compile-esm', () => compareFiles('_pug/require-assets-method-compile-esm'));
  test('require-assets-method-render', () => compareFiles('_pug/require-assets-method-render'));
  test('require-resource-in-mixin-argument', () => compareFiles('_pug/require-resource-in-mixin-argument'));
  test('require svg fragment', () => compareFiles('_pug/require-img-svg-fragment'));
});

describe('resolve assets in attrs', () => {
  test('resolve images', () => compareFiles('_pug/resolve-attr-images'));
  test('resolve styles', () => compareFiles('_pug/resolve-attr-styles'));
});

describe('resolve scripts', () => {
  test('script tags', () => compareFiles('_pug/require-script-tags'));
  test('webpack config: resolve.modules', () => compareFiles('_pug/resolve-modules'));
});

describe('require pug in javascript', () => {
  test(`js import pug, require assets, compile`, () => compareFiles('_pug/js-tmpl-resolve-assets-compile'));
  test(`js import pug, require assets, render`, () => compareFiles('_pug/js-tmpl-resolve-assets-render'));
  test(`js import pug with data, compile`, () => compareFiles('_pug/js-tmpl-data-external-compile'));
  test(`js import pug with data, render`, () => compareFiles('_pug/js-tmpl-data-external-render'));
});

describe('options tests', () => {
  test('basedir', () => compareFiles('_pug/option-basedir'));
  test('doctype html5', () => compareFiles('_pug/option-doctype-html5'));
  test(`default mode in js`, () => compareFiles('_pug/option-mode-default-js'));
  test(`render mode in js`, () => compareFiles('_pug/option-mode-render-js'));
  test(`mix modes in js: default with render`, () => compareFiles('_pug/option-mode-default-with-render-js'));
  test(`name`, () => compareFiles('_pug/option-name'));
  test(`loader option: esModule=false`, () => compareFiles('_pug/option-esModule-false'));
  test(`loader option: esModule=true`, () => compareFiles('_pug/option-esModule-true'));
});

describe('option data', () => {
  test('pass global data', () => compareFiles('_pug/option-data'));
  test('pass page data', () => compareFiles('_pug/option-data-mulipage'));
  test(`using self option`, () => compareFiles('_pug/option-data-self'));
});

describe('embedded filters tests', () => {
  test(`:escape`, () => compareFiles('_pug/filter-escape'));
  test(`:code`, () => compareFiles('_pug/filter-code'));
  test(`:code include files`, () => compareFiles('_pug/filter-code-include-files'));
  test(`:highlight`, () => compareFiles('_pug/filter-highlight'));
  test(':highlight prismjs - isInitialized', (done) => {
    const prismjs = require('../src/Loader/Preprocessors/Pug/filters/highlight/prismjs');
    // reset cached module
    prismjs.module = null;
    prismjs.init({});

    const result = prismjs.isInitialized();
    expect(result).toBeTruthy();
    done();
  });
});

describe('exception tests', () => {
  test('exception: filter not found', () => {
    const containString = `The 'embedFilters' option contains unknown filter:`;
    return exceptionContain('_pug/exception-filter-not-found', containString);
  });

  test('exception: by load a filter', (done) => {
    const expected = `Error by load`;
    const result = () => {
      filterLoadException('filter', '/path/', new Error('module not found'));
    };
    expect(result).toThrow(expected);
    done();
  });

  test('exception: filter :highlight - unsupported module', () => {
    const filterHighlight = require('../src/Loader/Preprocessors/Pug/filters/highlight');
    const adapterHighlight = require('../src/Loader/Preprocessors/Pug/filters/highlight/adapter');
    // reset cached module
    adapterHighlight.module = null;
    filterHighlight.module = null;

    const containString = `unsupported highlight module`;
    return exceptionContain('_pug/exception-filter-highlight-unsupported-module', containString);
  });

  test('exception: filter :highlight adapter - unsupported module', (done) => {
    const adapterHighlight = require('../src/Loader/Preprocessors/Pug/filters/highlight/adapter');
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
