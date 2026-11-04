import path from 'path';
import { PATHS } from './config';
import { compareFiles } from './utils/helpers';
import { compile } from './utils/webpack';

const getTemplateModule = (stats) => {
  const resource = path.join(stats.compilation.options.context, 'src/index.html');
  const module = [...stats.compilation.modules].find((module) => module.resource?.split('?', 1)[0] === resource);

  expect(module).toBeDefined();
  expect(module.buildInfo.hash).toEqual(expect.any(String));

  return module;
};

describe('config with contenthash', () => {
  const testCasePath = 'issue-195-contenthash';
  const testPath = path.join(PATHS.testSource, testCasePath);

  beforeAll(() => {
    process.env.NODE_ENV_TEST = 'true';
    process.env.BROWSERSLIST_IGNORE_OLD_DATA = 'true';
  });

  test('internal template module hashes and sources are independent of the project directory', async () => {
    const first = await compile(PATHS, `${testCasePath}/path1`, {});
    const second = await compile(PATHS, `${testCasePath}/path2`, {});
    const firstTemplate = getTemplateModule(first);
    const secondTemplate = getTemplateModule(second);

    // Diagnostic check of Webpack internals, stronger than final artifact equality.
    // Different intermediate hashes alone do not prove different emitted files.
    expect(firstTemplate.buildInfo.hash).toBe(secondTemplate.buildInfo.hash);
    expect(firstTemplate.originalSource().source().toString()).toBe(
      secondTemplate.originalSource().source().toString()
    );
  });

  test('emitted artifacts in both directories match path1/expected byte for byte', async () => {
    // path1/dist vs path1/expected.
    await compareFiles(`${testCasePath}/path1`);

    // path2/dist vs path1/dist, already checked against path1/expected.
    await compareFiles(`${testCasePath}/path2`, true, undefined, {
      pathReceived: path.join(testPath, 'path2/dist'),
      pathExpected: path.join(testPath, 'path1/dist'),
    });
  });
});

describe('config with fullhash', () => {
  const testCasePath = 'issue-195-fullhash';
  const testPath = path.join(PATHS.testSource, testCasePath);

  beforeAll(() => {
    process.env.NODE_ENV_TEST = 'true';
    process.env.BROWSERSLIST_IGNORE_OLD_DATA = 'true';
  });

  test('internal template module hashes and sources are independent of the project directory', async () => {
    const first = await compile(PATHS, `${testCasePath}/path1`, {});
    const second = await compile(PATHS, `${testCasePath}/path2`, {});
    const firstTemplate = getTemplateModule(first);
    const secondTemplate = getTemplateModule(second);

    // Diagnostic check of Webpack internals, stronger than final artifact equality.
    // Different intermediate hashes alone do not prove different emitted files.
    expect(firstTemplate.buildInfo.hash).toBe(secondTemplate.buildInfo.hash);
    expect(firstTemplate.originalSource().source().toString()).toBe(
      secondTemplate.originalSource().source().toString()
    );
  });

  test('emitted artifacts in both directories match path1/expected byte for byte', async () => {
    // path1/dist vs path1/expected.
    await compareFiles(`${testCasePath}/path1`);

    // path2/dist vs path1/dist, already checked against path1/expected.
    await compareFiles(`${testCasePath}/path2`, true, undefined, {
      pathReceived: path.join(testPath, 'path2/dist'),
      pathExpected: path.join(testPath, 'path1/dist'),
    });
  });
});
