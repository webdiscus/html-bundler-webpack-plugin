import path from 'path';
import ansis from 'ansis';
import { readDirRecursiveSync, readTextFileSync } from './file';
import { compile, watch } from './webpack';

/**
 * This is the patch for some environments, like `jest`.
 * The `jest` hasn't in global scope the `btoa` function which used in `css-loader`.
 */
if (typeof global.btoa === 'undefined') {
  global.btoa = (input) => Buffer.from(input, 'latin1').toString('base64');
}

export const getCompareFileList = function (receivedPath, expectedPath) {
  return {
    received: readDirRecursiveSync(receivedPath, false).sort(),
    expected: readDirRecursiveSync(expectedPath, false).sort(),
  };
};

export const getCompareFileContents = function (receivedFile, expectedFile, filter = /.(html|css|css.map|js|js.map)$/) {
  return filter.test(receivedFile) && filter.test(expectedFile)
    ? { received: readTextFileSync(receivedFile), expected: readTextFileSync(expectedFile) }
    : { received: '', expected: '' };
};

export const compareFileListAndContent = (PATHS, relTestCasePath, done) => {
  const absTestPath = path.join(PATHS.testSource, relTestCasePath),
    webRootPath = path.join(absTestPath, PATHS.webRoot),
    expectedPath = path.join(absTestPath, PATHS.expected);

  compile(PATHS, relTestCasePath, {}).then(() => {
    const { received: receivedFiles, expected: expectedFiles } = getCompareFileList(webRootPath, expectedPath);
    expect(receivedFiles).toEqual(expectedFiles);

    expectedFiles.forEach((file) => {
      const { received, expected } = getCompareFileContents(
        path.join(webRootPath, file),
        path.join(expectedPath, file)
      );
      expect(received).toEqual(expected);
    });
    done();
  });
};

export const watchCompareFileListAndContent = (PATHS, relTestCasePath, done) => {
  const absTestPath = path.join(PATHS.testSource, relTestCasePath),
    webRootPath = path.join(absTestPath, PATHS.webRoot),
    expectedPath = path.join(absTestPath, PATHS.expected);

  watch(PATHS, relTestCasePath, { devServer: { hot: true } }).then(() => {
    const { received: receivedFiles, expected: expectedFiles } = getCompareFileList(webRootPath, expectedPath);
    expect(receivedFiles).toEqual(expectedFiles);

    expectedFiles.forEach((file) => {
      const { received, expected } = getCompareFileContents(
        path.join(webRootPath, file),
        path.join(expectedPath, file)
      );
      expect(received).toEqual(expected);
    });
    done();
  });
};

export const exceptionContain = (PATHS, relTestCasePath, containString, done) => {
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

export const watchExceptionContain = function (PATHS, relTestCasePath, containString, done) {
  watch(PATHS, relTestCasePath, {}, (watching) => {
    watching.close();
  })
    .then(() => {
      throw new Error('the test should throw an error');
    })
    .catch((error) => {
      expect(error.toString()).toContain(containString);
      done();
    });
};

export const stdoutContain = function (PATHS, relTestCasePath, done) {
  const containString = readTextFileSync(path.join(PATHS.testSource, relTestCasePath, 'expected/output.txt'));
  const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

  compile(PATHS, relTestCasePath, {}).then(() => {
    const { calls } = stdout.mock;
    let output = calls.length > 0 ? calls[0][0] : '';
    output = ansis.strip(output);

    stdout.mockClear();
    stdout.mockRestore();

    expect(output).toContain(containString);
    done();
  });
};

export const watchStdoutCompare = function (methodName, PATHS, relTestCasePath, expectedString, done) {
  const stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});

  watch(PATHS, relTestCasePath, {}, (watching) => {
    watching.close();
  }).then(() => {
    const { calls } = stdout.mock;
    let output = calls.length > 0 ? calls[0][0] : '';
    output = ansis.strip(output);

    stdout.mockClear();
    stdout.mockRestore();

    if (methodName === 'toBeStringIgnoringWhitespace') {
      expectedString = expectedString.replace(/\s+/g, ' ').trim();
      output = output.replace(/\s+/g, ' ').trim();
      methodName = 'toBe';
    }

    expect(output)[methodName](expectedString);
    done();
  });
};

export const watchStdoutContain = function (PATHS, relTestCasePath, done) {
  const containString = readTextFileSync(path.join(PATHS.testSource, relTestCasePath, 'expected/output.txt'));
  watchStdoutCompare('toContain', PATHS, relTestCasePath, containString, done);
};
