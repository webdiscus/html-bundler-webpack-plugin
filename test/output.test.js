import { stdoutSnapshot, watchStdoutSnapshot } from './utils/helpers';

beforeAll(() => {
  // important: the environment constant is used in code
  process.env.NODE_ENV_TEST = 'true';
});

describe('verbose output into console', () => {
  test('verbose output', () => stdoutSnapshot('option-verbose-output'));
});

describe('watchFiles output into console', () => {
  test('watchFiles.files', () => watchStdoutSnapshot('option-watchFiles-files'));
  test('watchFiles.ignore', () => watchStdoutSnapshot('option-watchFiles-ignore'));
  test('watchFiles.paths', () => watchStdoutSnapshot('option-watchFiles-paths'));
});
