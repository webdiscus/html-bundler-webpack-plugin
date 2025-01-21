import {
  exceptionContain,
  stdoutContain,
  watchExceptionContain,
  watchStdoutContain,
  compareFiles,
} from './utils/helpers';
import { resolveModule } from '../src/Loader/Utils';
import { loadModule } from '../src/Common/FileUtils';

beforeAll(() => {
  // important: the environment constant is used in code
  // the value must be type string
  process.env.NODE_ENV_TEST = 'true';
});

describe('loader exceptions', () => {
  test('exception resolve: missing the closing', () => {
    const containString = `missing the closing '>' char`;
    return exceptionContain('_exceptions/msg-exception-loader-compile-close-tag', containString);
  });

  test('exception resolve: missing the closing at eof', () => {
    const containString = `missing the closing '>' char`;
    return exceptionContain('_exceptions/msg-exception-loader-compile-close-tag-eof', containString);
  });

  test('exception resolve: resolve file', () => {
    const containString = `Resolving of source files in the template file failed`;
    return exceptionContain('_exceptions/msg-exception-loader-resolve-file', containString);
  });

  test('exception resolve: resolve css file via enhanced-resolve', () => {
    const containString = `Can't resolve`;
    return exceptionContain('_exceptions/msg-exception-loader-resolve-file-enhanced', containString);
  });

  test('exception resolve: resolve js file', () => {
    const containString = `Resolving of source files in the template file failed`;
    return exceptionContain('_exceptions/msg-exception-loader-resolve-js', containString);
  });

  test('exception resolve: resolve js file via enhanced-resolve', () => {
    const containString = `Can't resolve`;
    return exceptionContain('_exceptions/msg-exception-loader-resolve-js-enhanced', containString);
  });

  test('exception export', () => {
    const containString = 'Export of compiled template failed';
    return exceptionContain('_exceptions/msg-exception-loader-export', containString);
  });

  test('exception: loader used without the plugin', () => {
    const containString = 'Illegal usage of the loader';
    return exceptionContain('_exceptions/msg-exception-loader-no-plugin', containString);
  });

  test('exception: handlebars include file not found', () => {
    const containString = 'Could not find the include file';
    return exceptionContain('_exceptions/msg-exception-handlebars-include', containString);
  });

  test('exception: handlebars partial file not found', () => {
    const containString = 'Could not find the partial';
    return exceptionContain('_exceptions/msg-exception-handlebars-partial', containString);
  });

  test('exception: loader data file not found', () => {
    const containString = `The data file not found`;
    return exceptionContain('_exceptions/msg-exception-loader-data-file-not-found', containString);
  });

  test('exception: loader data file is invalid', () => {
    const containString = `Load the data file failed`;
    return exceptionContain('_exceptions/msg-exception-loader-data-file-invalid', containString);
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

describe('plugin exceptions', () => {
  test('@import CSS is not supported', () => {
    const containString = `Disable the 'import' option in 'css-loader'`;
    return exceptionContain('_exceptions/msg-exception-plugin-import-css-rule', containString);
  });

  test('entry directory not found', () => {
    const containString = 'The directory is invalid or not found';
    return exceptionContain('_exceptions/msg-exception-option-entry-dir-not-found', containString);
  });

  test('entry is not directory', () => {
    const containString = 'The directory is invalid or not found';
    return exceptionContain('_exceptions/msg-exception-option-entry-not-dir', containString);
  });

  test('execute postprocess', () => {
    const containString = 'Postprocess failed';
    return exceptionContain('_exceptions/msg-exception-plugin-execute-postprocess', containString);
  });

  test('multiple chunks with same filename', () => {
    const containString = 'Multiple chunks emit assets to the same filename';
    return exceptionContain('_exceptions/msg-exception-plugin-multiple-chunks-same-filename', containString);
  });

  test('fail resolving asset without loader', () => {
    const containString = `Module parse failed: Unexpected character`;
    return exceptionContain('_exceptions/msg-exception-plugin-resolve-asset', containString);
  });

  test('file not found', () => {
    const containString = `File /path/to/images/not-exists.png not found`;
    return exceptionContain('_exceptions/msg-exception-plugin-resolve-file-not-found', containString);
  });

  test('integrity crossOrigin', () => {
    const containString = `must be specified the Webpack option 'output.crossOriginLoading'`;
    return exceptionContain('_exceptions/msg-exception-integrity-dynamic-crossOrigin', containString);
  });

  test('integrity display original error', () => {
    const containString = `You may need an appropriate loader to handle this file type`;
    return exceptionContain('_exceptions/msg-exception-integrity-display-original-error', containString);
  });

  test('inject css in HTML w/o head', () => {
    const containString = "The imported style can't be injected in HTML";
    return exceptionContain('_exceptions/msg-exception-import-css-wo-head', containString);
  });

  test('splitChunks CSS file not found', () => {
    const containString = "Add the 'splitChunks.cacheGroups.{cacheGroup}.test' option";
    return exceptionContain('_exceptions/msg-exception-split-chunk-css', containString);
  });

  test('css error if minify:true', () => {
    const containString = 'ERROR in ./src/style.scss';
    return exceptionContain('_exceptions/msg-exception-scss-with-minify', containString);
  });
});

describe('plugin option exceptions', () => {
  test('exception beforePreprocessor', () => {
    const containString = 'beforePreprocessor failed';
    return exceptionContain('_exceptions/msg-exception-loader-beforePreprocessor', containString);
  });

  test('exception sync preprocessor', () => {
    const containString = 'Preprocessor failed';
    return exceptionContain('_exceptions/msg-exception-loader-preprocessor', containString);
  });

  test('exception unsupported preprocessor value', () => {
    const containString = 'Unsupported preprocessor';
    return exceptionContain('_exceptions/msg-exception-loader-preprocessor-unsupported', containString);
  });

  test('exception async preprocessor', () => {
    const containString = 'Preprocessor failed';
    return exceptionContain('_exceptions/msg-exception-loader-preprocessor-async', containString);
  });

  test('preload: missing `as` property ', () => {
    const containString = `Missing the 'as' property in the plugin option preload`;
    return exceptionContain('_exceptions/msg-exception-plugin-option-preload-as', containString);
  });

  test('preload: invalid `as` property', () => {
    const containString = `Invalid value of the 'as' property in the plugin option preload`;
    return exceptionContain('_exceptions/msg-exception-plugin-option-preload-as-invalid', containString);
  });

  test('beforeEmit', () => {
    const containString = 'Before emit failed';
    return exceptionContain('_exceptions/msg-exception-plugin-option-beforeEmit', containString);
  });

  test('afterEmit', () => {
    const containString = 'After emit failed';
    return exceptionContain('_exceptions/msg-exception-plugin-option-afterEmit', containString);
  });
});

describe('css loader exceptions', () => {
  test('importModule fails', () => {
    const containString = 'SyntaxError';
    return exceptionContain('_exceptions/msg-exception-css-loader', containString);
  });

  test('resolveModule module not found', () => {
    const received = resolveModule('not-found-module');
    const expected = false;
    expect(received).toBe(expected);
  });

  test('resolveModule load corupped module not found', () => {
    const containString = 'ERR_INVALID_ARG_TYPE';

    try {
      // simulate exception ERR_INVALID_ARG_TYPE
      resolveModule('not-found-module', null);
      // Fail test if above expression doesn't throw anything.
      expect(true).toBe(false);
    } catch (e) {
      expect(e.code).toContain(containString);
    }
  });
});

describe('warnings', () => {
  test('plugin-favicons', () => {
    const containString = `Favicon file is not found`;
    return stdoutContain('_warnings/msg-warning-plugin-favicons-no-href', containString);
  });

  test('watchFiles.paths: dir not found', () => {
    const containString = `not-exists-dir`;
    return watchStdoutContain('_warnings/msg-warning-plugin-option-watchFiles-paths', containString);
  });

  test('splitChunks.chunks', () => {
    const containString = `The splitChunks.chunks option is automatically deleted`;
    return watchStdoutContain('_warnings/msg-warning-splitChunks', containString);
  });
});

describe('deprecations', () => {
  test('watchFiles-files', () => {
    const containString = `Use the 'watchFiles.includes' option`;
    return watchStdoutContain('_deprecations/msg-deprecation-watchFiles-files', containString);
  });

  test('watchFiles.ignore', () => {
    const containString = `Use the 'watchFiles.excludes' option`;
    return watchStdoutContain('_deprecations/msg-deprecation-watchFiles-ignore', containString);
  });
});
