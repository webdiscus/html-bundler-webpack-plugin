import { stdoutSnapshot, watchStdoutSnapshot } from './utils/helpers';

beforeAll(() => {
  // important: the environment constant is used in code
  process.env.NODE_ENV_TEST = 'true';
});

describe('build', () => {
  test('verbose output', () => stdoutSnapshot('option-verbose-output'));
  //test('import css with images in js', () => stdoutSnapshot('js-import-css-images'));
});

describe('watch', () => {
  test('watchFiles.files', () => watchStdoutSnapshot('option-watchFiles-files'));
  test('watchFiles.ignore', () => watchStdoutSnapshot('option-watchFiles-ignore'));
  test('watchFiles.paths', () => watchStdoutSnapshot('option-watchFiles-paths'));
});
