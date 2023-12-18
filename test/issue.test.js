import { compareFiles } from './utils/helpers';

beforeAll(() => {
  // important: the environment constant is used in code
  process.env.NODE_ENV_TEST = 'true';
});

describe('issue tests', () => {
  // - create new test based on the base or advanced template
  // - the directory name mus be as `issue-{issue-number}-{shot-description}`
  //   e.g.: `issue-35-fail-compilation`
  //   where `issue-number` is the number of an issue on GitHub
  // - the 2nd attribute is the directory name of your test case under `./test/cases/`
  // - run test: `npm run test:issue`

  test('issue base template', () => compareFiles('issue-0-base-template'));

  test('issue advanced template', () => compareFiles('issue-0-advanced-template'));

  test('issue infinity walk by circular dependency', () => compareFiles('issue-mui-css'));
});
