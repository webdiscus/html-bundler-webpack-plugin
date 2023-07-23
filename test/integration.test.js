import path from 'path';

import { compareFiles } from './utils/helpers';
import { removeDirsSync, syncExpected } from './utils/file';

// Remove all 'dist/' directories from tests, use it only for some local tests.
//removeDirsSync(__dirname, /dist$/);

// !!! ATTENTION - DANGER !!!
// After update packages and clean install, the new generated hashed filenames may be different from already expected.
// In this case, enable function `syncExpected` and run any single test, e.g. `hello world` only once. Then disable it.
// syncExpected(path.join(__dirname, 'cases'));

beforeAll(() => {
  // important: the environment constant is used in code
  process.env.NODE_ENV_TEST = 'true';
});

beforeEach(async () => {
  // sleep between tests to give time for GC
  //await new Promise((r) => setTimeout(r, 500));
});

describe('features tests', () => {
  test('Hello World!', () => compareFiles('hello-world'));
  test('use style in html', () => compareFiles('use-style-in-html'));
  test('use script in html', () => compareFiles('use-script-in-html'));
  test('resolve-js-in-many-pages', () => compareFiles('resolve-js-in-many-pages'));
});

describe('resolve files', () => {
  test('script style asset', () => compareFiles('resolve-script-style-asset'));
  test('many pages from same tmpl', () => compareFiles('resolve-in-many-pages-from-same-tmpl'));
  test('many pages from one html', () => compareFiles('resolve-in-many-pages-from-one-html'));
  test('relative paths', () => compareFiles('resolve-relative-paths'));
  test('alias in html', () => compareFiles('resolve-alias-in-html'));
  test('svg href with fragment', () => compareFiles('resolve-svg-use-fragment'));
  test('svg href with fragment, filename', () => compareFiles('resolve-svg-use-fragment-filename'));
  test('assets in multi pages', () => compareFiles('multipages'));
});

describe('resolve styles', () => {
  test('resolve styles loaded from node_modules', () => compareFiles('resolve-styles-from-module'));
  test('resolve styles with same name', () => compareFiles('resolve-styles-with-same-name'));
});

describe('real content hash', () => {
  test('real-contenthash-js', () => compareFiles('real-contenthash-js'));
});

describe('resolve url() in style', () => {
  test('url(image) in CSS', () => compareFiles('resolve-url-in-css'));
  test('CSS imported in module with .css', () => compareFiles('import-css-from-module-with-ext'));
  test('CSS imported from module without .css', () => compareFiles('import-css-from-module-wo-ext'));
  test('@import url() in CSS', () => compareFiles('import-url-in-css'));
  test('@import url() in SCSS', () => compareFiles('import-url-in-scss'));
  test('url() in nested style', () => compareFiles('resolve-url-in-nested-style'));
});

describe('plugin options', () => {
  test('publicPath = auto', () => compareFiles('option-output-public-path-auto'));
  test('publicPath = function', () => compareFiles('option-output-public-path-function'));
  test('publicPath = ""', () => compareFiles('option-output-public-path-empty'));
  test('publicPath = "/"', () => compareFiles('option-output-public-path-root'));
  test('publicPath = "/sub-path/"', () => compareFiles('option-output-public-path-custom'));
  test('publicPath = "http://localhost:8080"', () => compareFiles('option-output-public-path-url1'));
  test('publicPath = "http://localhost:8080/"', () => compareFiles('option-output-public-path-url2'));
  test('sourcePath and outputPath (default)', () => compareFiles('option-default-path'));
  test('sourcePath and outputPath', () => compareFiles('option-custom-path'));
  test('filename as function', () => compareFiles('option-filename-function'));
  test('js.filename', () => compareFiles('option-js-filename'));
  test('js.chunkFilename', () => compareFiles('option-js-chunkFilename'));
  test('js.chunkFilename as function', () => compareFiles('option-js-chunkFilename-function'));
  test('js and css outputPath absolute', () => compareFiles('option-js-css-outputPath-absolute'));
  test('js and css outputPath relative', () => compareFiles('option-js-css-outputPath-relative'));

  test('css.inline auto, dev', () => compareFiles('option-css-inline-auto-dev'));
  test('css.inline auto, prod', () => compareFiles('option-css-inline-auto-prod'));

  // test manually, because in development mode, IDs are generated randomly
  //test('js.inline auto, dev', () => compareFiles('option-js-inline-auto-dev'));
  //test('js.inline auto, prod', () => compareFiles('option-js-inline-auto-prod'));

  test('extractComments = false', () => compareFiles('option-extract-comments-false'));
  test('extractComments = true', () => compareFiles('option-extract-comments-true'));
  test('afterProcess', () => compareFiles('option-afterProcess'));
  test('postprocess', () => compareFiles('option-postprocess'));
  test('entry', () => compareFiles('option-entry'));
  test('entry data file', () => compareFiles('option-entry-data-file'));
  test('entry path', () => compareFiles('option-entry-path'));
  test('preload', () => compareFiles('option-preload'));
  test('preload attributes', () => compareFiles('option-preload-attributes'));
  test('preload with responsive images', () => compareFiles('option-preload-responsive-images'));

  //
  test('preprocessor', () => compareFiles('option-preprocessor'));

  // TODO: detect and remove unused split chinks
  //test('preload with split chunk', () => compareFiles('option-preload-split-chunk'));

  test('verbose', () => compareFiles('option-verbose'));
});

describe('plugin minify option', () => {
  test('minify HTML', () => compareFiles('option-minify'));
  test('minify HTML with custom options', () => compareFiles('option-minify-options'));
  test('minify auto prod', () => compareFiles('option-minify-auto-prod'));
  test('minify auto dev', () => compareFiles('option-minify-auto-dev'));
  test('minify auto options', () => compareFiles('option-minify-auto-options'));

  // minify parse error when used the "<" char in text
  // https://github.com/terser/html-minifier-terser/issues/28
  // test('minify HTML with "<" char', () => compareFiles('option-minify-html-chars'));
});

describe('loader options common', () => {
  test('defaults, when in module.rules is not defined', () => compareFiles('loader-option-defaults'));
  test('disable parsing for all tags and attributes', () => compareFiles('loader-option-sources-false'));
  test('add custom tags and attributes', () => compareFiles('loader-option-sources-attrs'));
  test('filter tags and attributes', () => compareFiles('loader-option-sources-attrs-filter'));
  test('filter property attribute', () => compareFiles('loader-option-sources-attrs-filter-property'));
  test('preprocessor by defaults', () => compareFiles('loader-option-preprocessor-default'));
  test('preprocessor disabled', () => compareFiles('loader-option-preprocessor-disabled'));
  test('preprocessor null', () => compareFiles('loader-option-preprocessor-return-null'));
  test('root', () => compareFiles('loader-option-root'));
});

describe('loader preprocessor options', () => {
  test('loader data', () => compareFiles('loader-option-preprocessor-data'));
  test('loader data file', () => compareFiles('loader-option-preprocessor-data-file'));

  test('Eta', () => compareFiles('loader-option-preprocessor-eta'));
  test('Eta async', () => compareFiles('loader-option-preprocessor-eta-async'));
  test('EJS', () => compareFiles('loader-option-preprocessor-ejs'));
  test('EJS async', () => compareFiles('loader-option-preprocessor-ejs-async'));
  test('EJS as string', () => compareFiles('loader-option-preprocessor-ejs-string'));

  test('handlebars', () => compareFiles('loader-option-preprocessor-handlebars'));
  test('handlebars helper', () => compareFiles('loader-option-preprocessor-handlebars-helpers'));
  test('handlebars helper path', () => compareFiles('loader-option-preprocessor-handlebars-helpers-path'));
  test('handlebars partials', () => compareFiles('loader-option-preprocessor-handlebars-partials'));
  test('handlebars partials path', () => compareFiles('loader-option-preprocessor-handlebars-partials-path'));

  test('liquid', () => compareFiles('loader-option-preprocessor-liquid'));
  test('liquid async', () => compareFiles('loader-option-preprocessor-liquid-async'));
  test('mustache', () => compareFiles('loader-option-preprocessor-mustache'));
  test('nunjucks sync', () => compareFiles('loader-option-preprocessor-nunjucks'));
  test('nunjucks async', () => compareFiles('loader-option-preprocessor-nunjucks-async'));

  test('simple multiple pages', () => compareFiles('loader-option-preprocessor-multipage'));
  test('multiple templating engines', () => compareFiles('loader-option-preprocessor-many-ejs-hbs'));
});

describe('inline images', () => {
  test('inline-asset-bypass-data-url', () => compareFiles('inline-asset-bypass-data-url'));
  test('inline-asset-decide-size', () => compareFiles('inline-asset-decide-size'));
  test('inline-asset-query', () => compareFiles('inline-asset-query'));
  test('inline-asset-html-css', () => compareFiles('inline-asset-html-css'));
  test('inline-asset-exclude-svg-fonts', () => compareFiles('inline-asset-exclude-svg-fonts'));
  test('inline-asset-source-svg', () => compareFiles('inline-asset-source-svg'));
  test('inline-asset-svg-favicon', () => compareFiles('inline-asset-svg-favicon'));
});

describe('inline styles & scripts', () => {
  test('inline css via `?inline` and resolve url()', () => compareFiles('inline-style-query'));
  test('inline css, source map, via `?inline`', () => compareFiles('inline-style-query-with-source-map'));
  test('inline js via `?inline`', () => compareFiles('inline-script-query'));
  test('inline js, runtimeChunk:single', () => compareFiles('inline-script-runtimeChunk-single'));
  test('inline js and css, minify', () => compareFiles('inline-js-css-with-minify'));
});

describe('import styles in JavaScript', () => {
  test('js-import-css', () => compareFiles('js-import-css'));
  test('simple import CJS', () => compareFiles('js-import-css-cjs'));
  test('simple import ESM', () => compareFiles('js-import-css-esm'));
  test('import css deep in js', () => compareFiles('js-import-css-deep'));
  test('simple import with images', () => compareFiles('js-import-css-images'));
  test('import scss from node module', () => compareFiles('js-import-css-from-module'));

  test('import CSS, @import url() in CSS', () => compareFiles('js-import-css-import-url-css'));
  test('import CSS, @import url() in SCSS', () => compareFiles('js-import-css-import-url-scss'));

  test('inline CSS', () => compareFiles('js-import-css-inline-css'));
  test('inline CSS, source map', () => compareFiles('js-import-css-inline-css-sourceMap'));

  test('inline images in CSS', () => compareFiles('js-import-css-inline-img-in-css'));
  test('inline images in inlined CSS', () => compareFiles('js-import-css-inline-img-in-inlined-css'));

  // source map
  test('nested, inline-source-map', () => compareFiles('js-import-css-nested-inline-source-map'));
  test('nested, source map', () => compareFiles('js-import-css-nested-source-map'));
  test('nested, url, source map', () => compareFiles('js-import-css-nested-source-map-image'));

  // special cases
  test('nested import, sorted', () => compareFiles('js-import-css-nested-sorted'));
  test('order dependencies', () => compareFiles('js-import-css-order-dependencies'));
  test('import one CSS from many JS files', () => compareFiles('js-import-css-one-from-many-js'));
  test('multiple-pages-same-asset', () => compareFiles('js-import-css-multiple-pages-same-asset'));
  test('multiple-pages-same-asset-inline', () => compareFiles('js-import-css-multiple-pages-same-asset-inline'));

  // the same styles can be used in many issuers, and these issuers can be imported in many other js/html files
  test('import same css in many js', () => compareFiles('js-import-css-same-in-many'));
  test('import same css in many js 2', () => compareFiles('js-import-css-same-in-many2'));
  test('import same css in many js 3', () => compareFiles('js-import-css-same-in-many3'));

  // split chunks
  test('js-import-css-split-chunk-js', () => compareFiles('js-import-css-split-chunk-js'));

  // TODO: create new mapping after resolving url() and after minification in optimization
  //test('nested, url, minified, source map', () => compareFiles('js-import-css-nested-source-map-image-minified'));

  // debug
  //test('js-import-sass-map-bug', () => compareFiles('js-import-sass-map-bug'));
  //test('js-import-css-debug-watch', () => compareFiles('js-import-css-debug-watch'));
});

// TODO: implement entryId via the query instead of layer to split all modules in separate files,
//  currently modules are grouped by layer, that is not optimal
describe('split chunks', () => {
  test('extract css and js w/o runtime code of css-loader', () => compareFiles('split-chunk-css-js'));
  test('import nested JS files', () => compareFiles('split-chunk-js-many-prod'));
  test('import JS and CSS from many modules', () => compareFiles('split-chunk-node-module-many-vendors'));
  test('import JS and CSS from one module', () => compareFiles('split-chunk-node-module-source'));

  test('resolve assets, development', () => compareFiles('split-chunk-resolve-assets-dev'));
  test('resolve assets, production', () => compareFiles('split-chunk-resolve-assets-prod'));
  test('load vendor scripts from node module', () => compareFiles('split-chunk-vendor'));

  // ATTENTION: this test doesn't work and never will be works.
  // This is just to demonstrate how a split of CSS files cannot be used. CSS files cannot be split.
  // test('extract css from split chunks ', () => compareFiles('split-chunk-css');
});

describe('special cases', () => {
  test('extract-css-from-entry', () => compareFiles('extract-css-from-entry'));
  test('resolve values with invalid syntax', () => compareFiles('resolve-values-invalid-syntax'));
  test('resolve assets without extension', () => compareFiles('resolve-assets-without-ext'));
  test('resolve assets in entries with a query', () => compareFiles('resolve-in-entry-with-query'));
  test('resolve manifest.json', () => compareFiles('resolve-manifest.json'));
  test('Template with CRLF line separator', () => compareFiles('template-clrf'));
  test('encode / decode reserved HTML chars', () => compareFiles('decode-chars'));
  test('preprocessor hbs load partials', () => compareFiles('preprocessor-hbs-partials'));
  test('preprocessor for output php template', () => compareFiles('preprocessor-php'));
  test('resolve preloaded script and style', () => compareFiles('resolve-preload-script-style'));
  test('preload, no head', () => compareFiles('preload-no-head'));
  test('preload, no head closing tag', () => compareFiles('preload-no-head-close'));
  test('ignore files defined in webpack entry', () => compareFiles('ignore-webpack-entry'));
  test('issue if copy plugin copies a html file', () => compareFiles('issue-copy-plugin'));

  // for debugging
  // test('resolve hmr file', () => watchCompareFileListAndContent(PATHS, 'resolve-hmr-file'));
});

describe('extras: responsive images', () => {
  test('images in template, publicPath="auto"', () => compareFiles('responsive-images'));
  test('images in template and in style', () => compareFiles('responsive-images-html-css'));
  test('images in template, in style an in js', () => compareFiles('responsive-images-html-css-js'));
  test('duplicate images in template and styles', () => compareFiles('responsive-images-many-duplicates'));
  test('images in template, publicPath="/"', () => compareFiles('responsive-images-publicPath-root'));
});

describe('use template in js', () => {
  // TODO: avoid to call 2x the same template
  test('require default template in js', () => compareFiles('require-tmpl-in-js'));
});
