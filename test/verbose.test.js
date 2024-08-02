import { stdoutSnapshot, watchStdoutSnapshot } from './utils/helpers';

beforeAll(() => {
  // important: the environment constant is used in code
  // the value must be type string
  process.env.NODE_ENV_TEST = 'true';
});

describe('build', () => {
  test('verbose output', () => stdoutSnapshot('option-verbose-output'));
  //test('import css with images in js', () => stdoutSnapshot('js-import-css-images'));
});

describe('watch', () => {
  test('watchFiles.includes', () => watchStdoutSnapshot('option-watchFiles-includes'));
  test('watchFiles.excludes', () => watchStdoutSnapshot('option-watchFiles-excludes'));
  test('watchFiles.paths', () => watchStdoutSnapshot('option-watchFiles-paths'));

  test('watchFiles pug', () => watchStdoutSnapshot('option-watchFiles-preprocessor-pug'));
});
