import fs from 'fs';
import os from 'os';
import path from 'path';
import webpack from 'webpack';
import HtmlBundlerPlugin from '../src';
import Snapshot from '../src/Plugin/Snapshot';
import { compareFiles, compareFilesRuns } from './utils/helpers';

beforeAll(() => {
  // important: the environment constant is used in code
  // the value must be type string
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

  test('filesystem cache restores script on second run, issue #190', async () => {
    const testPath = path.join(__dirname, 'issues/issue-190-cache-filesystem-js');
    const cleanup = () => {
      fs.rmSync(path.join(testPath, 'dist'), { recursive: true, force: true });
      fs.rmSync(path.join(testPath, '.cache'), { recursive: true, force: true });
    };

    cleanup();

    try {
      await compareFilesRuns('../issues/issue-190-cache-filesystem-js', false, 2);
    } finally {
      cleanup();
    }
  });

  test('multi compiler invalid hook handles null filename, issue #191', () => {
    const context = fs.mkdtempSync(path.join(os.tmpdir(), 'html-bundler-webpack-plugin-'));
    const sourcePath = path.join(context, 'src');

    fs.mkdirSync(sourcePath, { recursive: true });
    fs.writeFileSync(path.join(sourcePath, 'home.html'), '<!doctype html><script src="./home.js"></script>');
    fs.writeFileSync(path.join(sourcePath, 'home.js'), 'console.log("home");');
    fs.writeFileSync(path.join(sourcePath, 'about.html'), '<!doctype html><script src="./about.js"></script>');
    fs.writeFileSync(path.join(sourcePath, 'about.js'), 'console.log("about");');

    try {
      const compiler = webpack([
        {
          name: 'home',
          mode: 'development',
          context,
          output: {
            path: path.join(context, 'dist/home'),
          },
          plugins: [
            new HtmlBundlerPlugin({
              entry: {
                home: './src/home.html',
              },
            }),
          ],
        },
        {
          name: 'about',
          mode: 'development',
          context,
          output: {
            path: path.join(context, 'dist/about'),
          },
          plugins: [
            new HtmlBundlerPlugin({
              entry: {
                about: './src/about.html',
              },
            }),
          ],
        },
      ]);

      for (const childCompiler of compiler.compilers) {
        expect(() => childCompiler.hooks.invalid.call(null, null)).not.toThrow();
      }
    } finally {
      fs.rmSync(context, { recursive: true, force: true });
    }
  });

  test.each([
    {
      name: 'missing uses backslashes, restored uses slashes',
      issuer: 'C:\\path\\to\\index.html',
      missingFile: 'C:\\path\\to\\script.js',
      restoredFile: 'C:/path/to/script.js',
    },
    {
      name: 'missing uses slashes, restored uses backslashes',
      issuer: 'C:\\path\\to\\index.html',
      missingFile: 'C:/path/to/script.js',
      restoredFile: 'C:\\path\\to\\script.js',
    },
    {
      name: 'missing uses backslashes, restored uses backslashes',
      issuer: 'C:\\path\\to\\index.html',
      missingFile: 'C:\\path\\to\\script.js',
      restoredFile: 'C:\\path\\to\\script.js',
    },
    {
      name: 'missing uses slashes, restored uses slashes',
      issuer: 'C:/path/to/index.html',
      missingFile: 'C:/path/to/script.js',
      restoredFile: 'C:/path/to/script.js',
    },
    {
      name: 'missing script matches POSIX path',
      issuer: '/path/to/index.html',
      missingFile: '/path/to/script.js',
      restoredFile: '/path/to/script.js',
    },
  ])('watch restored missing script matches Windows paths: $name', ({ issuer, missingFile, restoredFile }) => {
    Snapshot.missingFiles.clear();
    Snapshot.addMissingFile(issuer, missingFile);

    try {
      expect(Snapshot.hasMissingFile(issuer, restoredFile)).toBe(true);
    } finally {
      Snapshot.missingFiles.clear();
    }
  });
});
