import path from 'path';

import {
  compareFileListAndContent,
  stdoutSnapshot,
  watchCompareFileListAndContent,
  watchStdoutSnapshot,
} from './utils/helpers';
import { removeDirsSync, syncExpected } from './utils/file';
import { PATHS } from './config';

// Remove all 'dist/' directories from tests, use it only for some local tests.
//removeDirsSync(__dirname, /dist$/);

// !!! ATTENTION - DANGER !!!
// After update packages and clean install, the new generated hashed filenames may be different from already expected.
// In this case, enable function `syncExpected` and run any single test, e.g. `hello world` only once. Then disable it.
//syncExpected(path.join(__dirname, 'cases'));

beforeAll(() => {});

beforeEach(() => {});

describe('features tests', () => {
  test('Hello World!', () => {
    return compareFileListAndContent(PATHS, 'hello-world');
  });

  test('resolve-script-style-asset', () => {
    return compareFileListAndContent(PATHS, 'resolve-script-style-asset');
  });

  test('resolve-in-many-pages-from-same-tmpl', () => {
    return compareFileListAndContent(PATHS, 'resolve-in-many-pages-from-same-tmpl');
  });

  test('resolve-in-many-pages-from-one-html', () => {
    return compareFileListAndContent(PATHS, 'resolve-in-many-pages-from-one-html');
  });

  test('resolve-relative-paths', () => {
    return compareFileListAndContent(PATHS, 'resolve-relative-paths');
  });

  test('resolve-alias-in-html', () => {
    return compareFileListAndContent(PATHS, 'resolve-alias-in-html');
  });

  test('resolve svg href with fragment', () => {
    return compareFileListAndContent(PATHS, 'resolve-svg-use-fragment');
  });

  test('resolve svg href with fragment in filename', () => {
    return compareFileListAndContent(PATHS, 'resolve-svg-use-fragment-filename');
  });
});

describe('resolve styles', () => {
  test('resolve styles with same name', () => {
    return compareFileListAndContent(PATHS, 'resolve-styles-with-same-name');
  });

  test('resolve styles loaded from node_modules', () => {
    return compareFileListAndContent(PATHS, 'resolve-styles-from-module');
  });
});

describe('resolve url in style', () => {
  test('resolve the url(image) in CSS', () => {
    return compareFileListAndContent(PATHS, 'resolve-url-in-css');
  });

  test('resolve the url(image) in CSS imported from module with .css', () => {
    return compareFileListAndContent(PATHS, 'import-css-from-module-with-ext');
  });

  test('resolve the url(image) in CSS imported from module without .css', () => {
    return compareFileListAndContent(PATHS, 'import-css-from-module-wo-ext');
  });

  test('@import url() in CSS', () => {
    return compareFileListAndContent(PATHS, 'import-url-in-css');
  });

  test('@import url() in SCSS', () => {
    return compareFileListAndContent(PATHS, 'import-url-in-scss');
  });

  test('resolve-url-deep', () => {
    return compareFileListAndContent(PATHS, 'resolve-url-deep');
  });
});

describe('plugin options', () => {
  test('output.publicPath = auto', () => {
    return compareFileListAndContent(PATHS, 'option-output-public-path-auto');
  });

  test('output.publicPath = function', () => {
    return compareFileListAndContent(PATHS, 'option-output-public-path-function');
  });

  test('output.publicPath = ""', () => {
    return compareFileListAndContent(PATHS, 'option-output-public-path-empty');
  });

  test('output.publicPath = "/"', () => {
    return compareFileListAndContent(PATHS, 'option-output-public-path-root');
  });

  test('output.publicPath = "/sub-path/"', () => {
    return compareFileListAndContent(PATHS, 'option-output-public-path-custom');
  });

  test('output.publicPath = "http://localhost:8080/"', () => {
    return compareFileListAndContent(PATHS, 'option-output-public-path-url');
  });

  test('sourcePath and outputPath (default)', () => {
    return compareFileListAndContent(PATHS, 'option-default-path');
  });

  test('sourcePath and outputPath', () => {
    return compareFileListAndContent(PATHS, 'option-custom-path');
  });

  test('filename as function', () => {
    return compareFileListAndContent(PATHS, 'option-filename-function');
  });

  test('js.filename', () => {
    return compareFileListAndContent(PATHS, 'option-js-filename');
  });

  test('js and css outputPath absolute', () => {
    return compareFileListAndContent(PATHS, 'option-js-css-outputPath-absolute');
  });

  test('js and css outputPath relative', () => {
    return compareFileListAndContent(PATHS, 'option-js-css-outputPath-relative');
  });

  test('css.inline auto, dev', () => {
    return compareFileListAndContent(PATHS, 'option-css-inline-auto-dev');
  });

  test('css.inline auto, prod', () => {
    return compareFileListAndContent(PATHS, 'option-css-inline-auto-prod');
  });

  test('js.inline auto, dev', () => {
    return compareFileListAndContent(PATHS, 'option-js-inline-auto-dev');
  });

  test('js.inline auto, prod', () => {
    return compareFileListAndContent(PATHS, 'option-js-inline-auto-prod');
  });

  test('verbose', () => {
    return compareFileListAndContent(PATHS, 'option-verbose');
  });

  test('verbose output', () => {
    return stdoutSnapshot(PATHS, 'option-verbose-output');
  });

  test('extractComments = false', () => {
    return compareFileListAndContent(PATHS, 'option-extract-comments-false');
  });

  test('extractComments = true', () => {
    return compareFileListAndContent(PATHS, 'option-extract-comments-true');
  });

  test('postprocess', () => {
    return compareFileListAndContent(PATHS, 'option-postprocess');
  });

  test('afterProcess', () => {
    return compareFileListAndContent(PATHS, 'option-afterProcess');
  });

  test('entry', () => {
    return compareFileListAndContent(PATHS, 'option-entry');
  });

  test('entry data file', () => {
    return compareFileListAndContent(PATHS, 'option-entry-data-file');
  });

  test('entry path', () => {
    return compareFileListAndContent(PATHS, 'option-entry-path');
  });

  test('preload', () => {
    return compareFileListAndContent(PATHS, 'option-preload');
  });

  test('preload with responsive images', () => {
    return compareFileListAndContent(PATHS, 'option-preload-responsive-images');
  });

  test('preload with split chunk', () => {
    return compareFileListAndContent(PATHS, 'option-preload-split-chunk');
  });
});

describe('plugin minify option', () => {
  test('minify HTML', () => {
    return compareFileListAndContent(PATHS, 'option-minify');
  });

  test('minify HTML with custom options', () => {
    return compareFileListAndContent(PATHS, 'option-minify-options');
  });

  test('minify auto prod', () => {
    return compareFileListAndContent(PATHS, 'option-minify-auto-prod');
  });

  test('minify auto dev', () => {
    return compareFileListAndContent(PATHS, 'option-minify-auto-dev');
  });

  test('minify auto options', () => {
    return compareFileListAndContent(PATHS, 'option-minify-auto-options');
  });

  // minify parse error when used the "<" char in text
  // https://github.com/terser/html-minifier-terser/issues/28
  // test('minify HTML with "<" char', () => {
  //   return compareFileListAndContent(PATHS, 'option-minify-html-chars', );
  // });
});

describe('option watchFiles', () => {
  test('watchFiles.files', () => {
    return watchStdoutSnapshot(PATHS, 'option-watchFiles-files');
  });

  test('watchFiles.ignore', () => {
    return watchStdoutSnapshot(PATHS, 'option-watchFiles-ignore');
  });

  test('watchFiles.paths', () => {
    return watchStdoutSnapshot(PATHS, 'option-watchFiles-paths');
  });
});

describe('loader options', () => {
  test('defaults option when in module.rules is not defined', () => {
    return compareFileListAndContent(PATHS, 'loader-option-defaults');
  });

  test('disable the processing of all tags and attributes', () => {
    return compareFileListAndContent(PATHS, 'loader-option-sources-false');
  });

  test('add custom tags and attributes', () => {
    return compareFileListAndContent(PATHS, 'loader-option-sources-attrs');
  });

  test('filter tags and attributes', () => {
    return compareFileListAndContent(PATHS, 'loader-option-sources-attrs-filter');
  });

  test('filter property attribute', () => {
    return compareFileListAndContent(PATHS, 'loader-option-sources-attrs-filter-property');
  });

  test('preprocessor by defaults', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-default');
  });

  test('preprocessor disabled', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-disabled');
  });

  test('preprocessor return null', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-return-null');
  });

  test('root', () => {
    return compareFileListAndContent(PATHS, 'loader-option-root');
  });
});

describe('loader options for templating', () => {
  test('loader data', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-data');
  });

  test('loader data file', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-data-file');
  });

  test('preprocessor Eta', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-eta');
  });

  test('preprocessor Eta async', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-eta-async');
  });

  test('preprocessor EJS', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-ejs');
  });

  test('preprocessor EJS async', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-ejs-async');
  });

  test('preprocessor EJS as string', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-ejs-string');
  });

  test('preprocessor handlebars', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-handlebars');
  });

  test('preprocessor handlebars: register helper functions', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-handlebars-helpers');
  });

  test('preprocessor handlebars: register helpers from path', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-handlebars-helpers-path');
  });

  test('preprocessor handlebars: register partials', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-handlebars-partials');
  });

  test('preprocessor handlebars: register partials from paths', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-handlebars-partials-path');
  });

  test('preprocessor Mustache', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-mustache');
  });

  test('preprocessor for simple multipage', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-multipage');
  });

  test('preprocessor for multipage with nunjucks', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-nunjucks-multipage');
  });

  test('preprocessor for multipage with nunjucks async', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-nunjucks-async-multipage');
  });

  test('preprocessor liquid', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-liquid');
  });

  test('preprocessor liquid async', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-liquid-async');
  });

  test('preprocessor with multiple templating engines', () => {
    return compareFileListAndContent(PATHS, 'loader-option-preprocessor-many-ejs-hbs');
  });
});

describe('inline images', () => {
  test('inline-asset-bypass-data-url', () => {
    return compareFileListAndContent(PATHS, 'inline-asset-bypass-data-url');
  });

  test('inline-asset-decide-size', () => {
    return compareFileListAndContent(PATHS, 'inline-asset-decide-size');
  });

  test('inline-asset-query', () => {
    return compareFileListAndContent(PATHS, 'inline-asset-query');
  });

  test('inline-asset-html-css', () => {
    return compareFileListAndContent(PATHS, 'inline-asset-html-css');
  });

  test('inline-asset-exclude-svg-fonts', () => {
    return compareFileListAndContent(PATHS, 'inline-asset-exclude-svg-fonts');
  });

  test('inline-asset-svg-favicon', () => {
    return compareFileListAndContent(PATHS, 'inline-asset-svg-favicon');
  });

  test('inline-asset-source-svg', () => {
    return compareFileListAndContent(PATHS, 'inline-asset-source-svg');
  });
});

describe('inline styles & scripts', () => {
  test('inline style using URL query `?inline` and resolve url() in CSS', () => {
    return compareFileListAndContent(PATHS, 'inline-style-query');
  });

  test('inline style with source map using URL query `?inline`', () => {
    return compareFileListAndContent(PATHS, 'inline-style-query-with-source-map');
  });

  test('inline script using URL query `?inline`', () => {
    return compareFileListAndContent(PATHS, 'inline-script-query');
  });

  test('inline script using when used runtimeChunk:single', () => {
    return compareFileListAndContent(PATHS, 'inline-script-runtimeChunk-single');
  });

  test('inline js and css with minify', () => {
    return compareFileListAndContent(PATHS, 'inline-js-css-with-minify');
  });
});

describe('split chunks', () => {
  test('extract css and js w/o runtime code of css-loader', () => {
    return compareFileListAndContent(PATHS, 'split-chunk-css-js');
  });

  test('import source scripts and styles from many node module', () => {
    return compareFileListAndContent(PATHS, 'split-chunk-node-module-many-vendors');
  });

  test('import source scripts and styles from node module', () => {
    return compareFileListAndContent(PATHS, 'split-chunk-node-module-source');
  });

  test('resolve assets when used split chunk, development', () => {
    return compareFileListAndContent(PATHS, 'split-chunk-resolve-assets-dev');
  });

  test('resolve assets when used split chunk, production', () => {
    return compareFileListAndContent(PATHS, 'split-chunk-resolve-assets-prod');
  });

  test('load vendor scripts from node module', () => {
    return compareFileListAndContent(PATHS, 'split-chunk-vendor');
  });

  // ATTENTION: this test doesn't work and never will be works.
  // This is just to demonstrate how a split of CSS files cannot be used. CSS files cannot be split.
  // test('extract css from split chunks ', () => {
  //   return compareFileListAndContent(PATHS, 'split-chunk-css', );
  // });
});

describe('special cases', () => {
  test('resolve values with invalid syntax', () => {
    return compareFileListAndContent(PATHS, 'resolve-values-invalid-syntax');
  });

  test('resolve assets without extension', () => {
    return compareFileListAndContent(PATHS, 'resolve-assets-without-ext');
  });

  test('resolve assets in entries with a query', () => {
    return compareFileListAndContent(PATHS, 'resolve-in-entry-with-query');
  });

  test('resolve manifest.json', () => {
    return compareFileListAndContent(PATHS, 'resolve-manifest.json');
  });

  test('Template with CRLF line separator', () => {
    return compareFileListAndContent(PATHS, 'template-clrf');
  });

  test('encode / decode reserved HTML chars', () => {
    return compareFileListAndContent(PATHS, 'decode-chars');
  });

  test('preprocessor for output php template', () => {
    return compareFileListAndContent(PATHS, 'preprocessor-php');
  });

  test('resolve preloaded script and style', () => {
    return compareFileListAndContent(PATHS, 'resolve-preload-script-style');
  });

  test('preload, no head', () => {
    return compareFileListAndContent(PATHS, 'preload-no-head');
  });

  test('preload, no head closing tag', () => {
    return compareFileListAndContent(PATHS, 'preload-no-head-close');
  });

  test('ignore files defined in webpack entry', () => {
    return compareFileListAndContent(PATHS, 'ignore-webpack-entry');
  });

  test('issue if copy plugin copies a html file', () => {
    return compareFileListAndContent(PATHS, 'issue-copy-plugin');
  });

  // for debugging
  // test('resolve hmr file', () => {
  //   return watchCompareFileListAndContent(PATHS, 'resolve-hmr-file');
  // });
});

describe('extras: responsive images', () => {
  test('responsive images in template, publicPath="auto"', () => {
    return compareFileListAndContent(PATHS, 'responsive-images');
  });

  test('responsive images in template, publicPath="/"', () => {
    return compareFileListAndContent(PATHS, 'responsive-images-publicPath-root');
  });

  test('require images in template and in style', () => {
    return compareFileListAndContent(PATHS, 'responsive-images-html-scss');
  });

  test('require many duplicate images in template and styles', () => {
    return compareFileListAndContent(PATHS, 'responsive-images-many-duplicates');
  });
});

describe('use template in js', () => {
  test('require default template in js', () => {
    return compareFileListAndContent(PATHS, 'require-tmpl-in-js');
  });
});
