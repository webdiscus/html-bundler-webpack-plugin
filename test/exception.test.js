import { exceptionContain, watchExceptionContain } from './utils/helpers';
import { loadModule } from '../src/Common/FileUtils';

beforeAll(() => {
  // important: the environment constant is used in code
  process.env.NODE_ENV_TEST = 'true';
});

describe('loader exceptions', () => {
  test('exception sync preprocessor', () => {
    const containString = 'Preprocessor failed';
    return exceptionContain('msg-exception-loader-preprocessor', containString);
  });

  test('exception unsupported preprocessor value', () => {
    const containString = 'Unsupported preprocessor';
    return exceptionContain('msg-exception-loader-preprocessor-unsupported', containString);
  });

  test('exception async preprocessor', () => {
    const containString = 'Preprocessor failed';
    return exceptionContain('msg-exception-loader-preprocessor-async', containString);
  });

  test('exception compile: missing the closing', () => {
    const containString = `missing the closing '>' char`;
    return exceptionContain('msg-exception-loader-compile-close-tag', containString);
  });

  test('exception compile: missing the closing at eof', () => {
    const containString = `missing the closing '>' char`;
    return exceptionContain('msg-exception-loader-compile-close-tag-eof', containString);
  });

  test('exception compile: resolve file', () => {
    const containString = `Can't resolve`;
    return exceptionContain('msg-exception-loader-resolve-file', containString);
  });

  test('exception compile: resolve css file via enhanced-resolve', () => {
    const containString = `Can't resolve`;
    return exceptionContain('msg-exception-loader-resolve-file-enhanced', containString);
  });

  test('exception compile: resolve js file', () => {
    const containString = `Can't resolve`;
    return exceptionContain('msg-exception-loader-resolve-js', containString);
  });

  test('exception compile: resolve js file via enhanced-resolve', () => {
    const containString = `Can't resolve`;
    return exceptionContain('msg-exception-loader-resolve-js-enhanced', containString);
  });

  test('exception export', () => {
    const containString = 'Export of compiled template failed';
    return exceptionContain('msg-exception-loader-export', containString);
  });

  test('exception: loader used without the plugin', () => {
    const containString = 'Illegal usage of the loader';
    return exceptionContain('msg-exception-loader-no-plugin', containString);
  });

  test('exception: handlebars include file not found', () => {
    const containString = 'Could not find the include file';
    return exceptionContain('msg-exception-handlebars-include', containString);
  });

  test('exception: handlebars partial file not found', () => {
    const containString = 'Could not find the partial';
    return exceptionContain('msg-exception-handlebars-partial', containString);
  });

  test('exception: loader data file not found', () => {
    const containString = `The data file not found`;
    return exceptionContain('msg-exception-loader-data-file-not-found', containString);
  });

  test('exception: loader data file is invalid', () => {
    const containString = `Load the data file failed`;
    return exceptionContain('msg-exception-loader-data-file-invalid', containString);
  });

  test('exception preprocessor: load module', () => {
    const containString = 'Cannot find module';
    return expect(
      new Promise(() => {
        loadModule('not-exists-module');
      })
        .then(() => {
          return Promise.reject('the test should throw an error');
        })
        .catch((error) => {
          return Promise.reject(error.toString());
        })
    ).rejects.toContain(containString);
  });
});

describe('watch exceptions', () => {
  test('watchFiles.paths: dir not found', () => {
    const containString = `The watch directory not found`;
    return watchExceptionContain('msg-exception-plugin-option-watchFiles-paths', containString);
  });
});

describe('plugin exceptions', () => {
  test('@import CSS is not supported', () => {
    const containString = `Disable the 'import' option in 'css-loader'`;
    return exceptionContain('msg-exception-plugin-import-css-rule', containString);
  });

  test('entry directory not found', () => {
    const containString = 'The directory is invalid or not found';
    return exceptionContain('msg-exception-option-entry-dir-not-found', containString);
  });

  test('entry is not directory', () => {
    const containString = 'The directory is invalid or not found';
    return exceptionContain('msg-exception-option-entry-not-dir', containString);
  });

  test('execute postprocess', () => {
    const containString = 'Postprocess failed';
    return exceptionContain('msg-exception-plugin-execute-postprocess', containString);
  });

  test('multiple chunks with same filename', () => {
    const containString = 'Multiple chunks emit assets to the same filename';
    return exceptionContain('msg-exception-plugin-multiple-chunks-same-filename', containString);
  });

  test('fail resolving asset without loader', () => {
    const containString = `Module parse failed: Unexpected character`;
    return exceptionContain('msg-exception-plugin-resolve-asset', containString);
  });

  test('preload option: missing `as` property ', () => {
    const containString = `Missing the 'as' property in the plugin option preload`;
    return exceptionContain('msg-exception-plugin-option-preload-as', containString);
  });

  test('preload option: invalid `as` property', () => {
    const containString = `Invalid value of the 'as' property in the plugin option preload`;
    return exceptionContain('msg-exception-plugin-option-preload-as-invalid', containString);
  });

  test('option afterProcess', () => {
    const containString = 'After process failed';
    return exceptionContain('msg-exception-plugin-option-afterProcess', containString);
  });

  test('inject css in HTML w/o head', () => {
    const containString = "The imported style can't be injected in HTML";
    return exceptionContain('msg-exception-import-css-wo-head', containString);
  });
});

describe('css loader exceptions', () => {
  test('importModule fails', () => {
    const containString = 'SyntaxError';
    return exceptionContain('msg-exception-css-loader', containString);
  });
});
