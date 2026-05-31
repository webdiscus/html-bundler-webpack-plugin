import fs from 'fs';
import os from 'os';
import path from 'path';
import webpack from 'webpack';
import HtmlBundlerPlugin from '../src';
import { compareFiles } from './utils/helpers';

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
});
