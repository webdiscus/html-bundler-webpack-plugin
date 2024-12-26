import path from 'path';
import ansis from 'ansis';
import { readDirRecursiveSync, readTextFileSync } from './file';
import { compile, watch } from './webpack';
import { PATHS } from '../config';

/**
 * This is the patch for some environments, like `jest`.
 * The `jest` hasn't in global scope the `btoa` function which is used in `css-loader`.
 */
if (typeof global.btoa === 'undefined') {
  global.btoa = (input) => Buffer.from(input, 'latin1').toString('base64');
}

expect.extend({
  toMatchBinaryData(received, expected) {
    const pass = Buffer.compare(received, expected) === 0;
    return {
      message: () => (pass ? 'Binary data matches!' : 'Binary data does not match!'),
      pass,
    };
  },
});

export const getCompareFileList = function (receivedPath, expectedPath) {
  return {
    received: readDirRecursiveSync(receivedPath)
      .map((file) => path.relative(receivedPath, file))
      .sort(),
    expected: readDirRecursiveSync(expectedPath)
      .map((file) => path.relative(expectedPath, file))
      .sort(),
  };
};

/**
 * @param {string} receivedFile
 * @param {string} expectedFile
 * @param {RegExp|null} filter The filter which files should be compared by content.
 * @return {{received: *, expected: *}|{received: string, expected: string}}
 */
export const compareFileContents = function (receivedFile, expectedFile, filter) {
  let result = { received: '', expected: '' };
  let binaryFilter = /.(gz|svg)$/;
  let encoding = 'utf8';

  if (filter.test(receivedFile) && filter.test(expectedFile)) {
    if (binaryFilter.test(receivedFile)) {
      encoding = 'binary';
    }
    result = { received: readTextFileSync(receivedFile, encoding), expected: readTextFileSync(expectedFile, encoding) };
  }

  if (encoding === 'binary') {
    try {
      expect(Buffer.from(result.received)).toMatchBinaryData(Buffer.from(result.expected));
    } catch (e) {
      let message = `\nCompare binary files:\n${receivedFile}\n${expectedFile}\n${e}`;
      throw new Error(message);
    }
  } else {
    expect(result.received).toEqual(result.expected);
  }
};

/**
 * Compare the file list and content of files.
 *
 * @param {string} relTestCasePath The relative path to the test directory.
 * @param {boolean} compareContent Whether the content of files should be compared too.
 * @param {RegExp|null} filter
 * @return {Promise<void>}
 */
export const compareFiles = (
  relTestCasePath,
  compareContent = true,
  filter = /.(html|css|css.map|js|js.map|json)$/
) => {
  const absTestPath = path.join(PATHS.testSource, relTestCasePath),
    webRootPath = path.join(absTestPath, PATHS.webRoot),
    expectedPath = path.join(absTestPath, PATHS.expected);

  return expect(
    compile(PATHS, relTestCasePath, {})
      .then(() => {
        const { received: receivedFiles, expected: expectedFiles } = getCompareFileList(webRootPath, expectedPath);
        expect(receivedFiles).toEqual(expectedFiles);

        if (compareContent) {
          expectedFiles.forEach((file) => {
            compareFileContents(path.join(webRootPath, file), path.join(expectedPath, file), filter);
          });
        }

        return Promise.resolve(true);
      })
      .catch((error) => {
        return Promise.reject(error);
      })
  ).resolves.toBe(true);
};

/**
 * Compare the file list and content of files after calling N times.
 * Used for testing the cache filesystem.
 *
 * @param {string} relTestCasePath The relative path to the test directory.
 * @param {boolean} compareContent Whether the content of files should be compared too.
 * @param {number} num Number of calls
 * @return {Promise<void>}
 */
export const compareFilesRuns = (relTestCasePath, compareContent = true, num = 1) => {
  const absTestPath = path.join(PATHS.testSource, relTestCasePath),
    webRootPath = path.join(absTestPath, PATHS.webRoot),
    expectedPath = path.join(absTestPath, PATHS.expected);

  const results = [];
  const expected = Array(num).fill(true);
  const filter = /.(html|css|css.map|js|js.map|json)$/;

  for (let i = 0; i < num; i++) {
    const res = compile(PATHS, relTestCasePath, {})
      .then(() => {
        const { received: receivedFiles, expected: expectedFiles } = getCompareFileList(webRootPath, expectedPath);
        expect(receivedFiles).toEqual(expectedFiles);

        if (compareContent) {
          expectedFiles.forEach((file) => {
            compareFileContents(path.join(webRootPath, file), path.join(expectedPath, file), filter);
          });
        }

        return Promise.resolve(true);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
    results.push(res);
  }

  return expect(Promise.all(results)).resolves.toEqual(expected);
};

/**
 * Compare the file list and content of files it the serve/watch mode.
 *
 * @param {string} relTestCasePath The relative path to the test directory.
 * @param {boolean} compareContent Whether the content of files should be compared too.
 * @param {RegExp|null} filter
 * @return {Promise<void>}
 */
export const watchCompareFiles = (
  relTestCasePath,
  compareContent = true,
  filter = /.(html|css|css.map|js|js.map|json)$/
) => {
  const absTestPath = path.join(PATHS.testSource, relTestCasePath),
    webRootPath = path.join(absTestPath, PATHS.webRoot),
    expectedPath = path.join(absTestPath, PATHS.expected);

  return expect(
    watch(PATHS, relTestCasePath, { devServer: { hot: true } })
      .then(() => {
        const { received: receivedFiles, expected: expectedFiles } = getCompareFileList(webRootPath, expectedPath);
        expect(receivedFiles).toEqual(expectedFiles);

        if (compareContent) {
          expectedFiles.forEach((file) => {
            compareFileContents(path.join(webRootPath, file), path.join(expectedPath, file), filter);
          });
        }

        return Promise.resolve(true);
      })
      .catch((error) => {
        return Promise.reject(error);
      })
  ).resolves.toBe(true);
};

export const exceptionContain = (relTestCasePath, containString) => {
  return expect(
    compile(PATHS, relTestCasePath, {})
      .then(() => {
        return Promise.reject('the test should throw an error');
      })
      .catch((error) => {
        const message = ansis.strip(error.toString());
        return Promise.reject(message);
      })
  ).rejects.toContain(containString);
};

export const stdoutContain = (relTestCasePath, containString) => {
  const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

  return expect(
    compile(PATHS, relTestCasePath, {}).then(() => {
      const { calls } = stdout.mock;
      let output = calls.length > 0 ? calls[0][0] : '';
      output = ansis.strip(output);

      stdout.mockClear();
      stdout.mockRestore();

      return Promise.resolve(output);
    })
  ).resolves.toContain(containString);
};

export const watchStdoutContain = (relTestCasePath, containString) => {
  const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

  return expect(
    watch(PATHS, relTestCasePath, {}, (watching) => {
      watching.close();
    }).then(() => {
      const { calls } = stdout.mock;
      let output = calls.length > 0 ? calls[0][0] : '';
      output = ansis.strip(output);

      stdout.mockClear();
      stdout.mockRestore();

      return Promise.resolve(output);
    })
  ).resolves.toContain(containString);
};

export const watchExceptionContain = function (relTestCasePath, containString) {
  return expect(
    watch(PATHS, relTestCasePath, {}, (watching) => {
      watching.close();
    })
      .then(() => {
        return Promise.reject('the test should throw an error');
      })
      .catch((error) => {
        const message = ansis.strip(error.toString());
        return Promise.reject(message);
      })
  ).rejects.toContain(containString);
};

export const stdoutSnapshot = function (relTestCasePath, done) {
  const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

  return expect(
    compile(PATHS, relTestCasePath, {}).then(() => {
      const { calls } = stdout.mock;
      let output = calls.length > 0 ? calls[0][0] : '';
      output = ansis.strip(output);

      stdout.mockClear();
      stdout.mockRestore();

      return Promise.resolve(output);
    })
  ).resolves.toMatchSnapshot();
};

export const watchStdoutSnapshot = function (relTestCasePath, done) {
  const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

  return expect(
    watch(PATHS, relTestCasePath, {}, (watching) => {
      watching.close();
    }).then(() => {
      const { calls } = stdout.mock;
      let output = calls.length > 0 ? calls[0][0] : '';
      output = ansis.strip(output);

      stdout.mockClear();
      stdout.mockRestore();

      return Promise.resolve(output);
    })
  ).resolves.toMatchSnapshot();
};
