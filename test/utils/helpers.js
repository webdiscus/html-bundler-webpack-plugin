import path from 'path';
import ansis from 'ansis';
import { readDirRecursiveSync, readTextFileSync } from './file';
import { compile, watch } from './webpack';

/**
 * This is the patch for some environments, like `jest`.
 * The `jest` hasn't in global scope the `btoa` function which is used in `css-loader`.
 */
if (typeof global.btoa === 'undefined') {
  global.btoa = (input) => Buffer.from(input, 'latin1').toString('base64');
}

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

export const getCompareFileContents = function (receivedFile, expectedFile, filter = /.(html|css|css.map|js|js.map)$/) {
  return filter.test(receivedFile) && filter.test(expectedFile)
    ? { received: readTextFileSync(receivedFile), expected: readTextFileSync(expectedFile) }
    : { received: '', expected: '' };
};

export const compareFileListAndContent = (PATHS, relTestCasePath) => {
  const absTestPath = path.join(PATHS.testSource, relTestCasePath),
    webRootPath = path.join(absTestPath, PATHS.webRoot),
    expectedPath = path.join(absTestPath, PATHS.expected);

  return expect(
    compile(PATHS, relTestCasePath, {})
      .then(() => {
        const { received: receivedFiles, expected: expectedFiles } = getCompareFileList(webRootPath, expectedPath);
        expect(receivedFiles).toEqual(expectedFiles);

        expectedFiles.forEach((file) => {
          const { received, expected } = getCompareFileContents(
            path.join(webRootPath, file),
            path.join(expectedPath, file)
          );
          expect(received).toEqual(expected);
        });
        return Promise.resolve(true);
      })
      .catch((error) => {
        return Promise.reject(error);
      })
  ).resolves.toBe(true);
};

export const watchCompareFileListAndContent = (PATHS, relTestCasePath) => {
  const absTestPath = path.join(PATHS.testSource, relTestCasePath),
    webRootPath = path.join(absTestPath, PATHS.webRoot),
    expectedPath = path.join(absTestPath, PATHS.expected);

  return expect(
    watch(PATHS, relTestCasePath, { devServer: { hot: true } })
      .then(() => {
        const { received: receivedFiles, expected: expectedFiles } = getCompareFileList(webRootPath, expectedPath);
        expect(receivedFiles).toEqual(expectedFiles);

        expectedFiles.forEach((file) => {
          const { received, expected } = getCompareFileContents(
            path.join(webRootPath, file),
            path.join(expectedPath, file)
          );
          expect(received).toEqual(expected);
        });
        return Promise.resolve(true);
      })
      .catch((error) => {
        return Promise.reject(error);
      })
  ).resolves.toBe(true);
};

export const exceptionContain = (PATHS, relTestCasePath, containString) => {
  return expect(
    compile(PATHS, relTestCasePath, {})
      .then(() => {
        return Promise.reject('the test should throw an error');
      })
      .catch((error) => {
        return Promise.reject(error.toString());
      })
  ).rejects.toContain(containString);
};

export const watchExceptionContain = function (PATHS, relTestCasePath, containString) {
  return expect(
    watch(PATHS, relTestCasePath, {}, (watching) => {
      watching.close();
    })
      .then(() => {
        return Promise.reject('the test should throw an error');
      })
      .catch((error) => {
        return Promise.reject(error.toString());
      })
  ).rejects.toContain(containString);
};

export const stdoutSnapshot = function (PATHS, relTestCasePath, done) {
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

export const watchStdoutSnapshot = function (PATHS, relTestCasePath, done) {
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
