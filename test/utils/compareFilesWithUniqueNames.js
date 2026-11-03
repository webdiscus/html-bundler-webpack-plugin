import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { compile } from './webpack';
import { PATHS } from '../config';

const readFiles = (directory, relativePath = '') =>
  fs.readdirSync(path.join(directory, relativePath), { withFileTypes: true }).flatMap((entry) => {
    const filename = path.posix.join(relativePath, entry.name);
    return entry.isDirectory() ? readFiles(directory, filename) : [filename];
  });

const describeFiles = (directory) =>
  readFiles(directory).map((filename) => {
    const content = fs.readFileSync(path.join(directory, filename));
    const isAsset = /\.(js|css)$/.test(filename);
    const family = path.posix.join(
      path.posix.dirname(filename),
      path.posix.basename(filename).replace(/\.\d+(?=\.)/g, '')
    );
    // Equal content alone is insufficient: unrelated filenames must not match.
    const identity = isAsset ? `${family}:${createHash('sha256').update(content).digest('hex')}` : filename;
    return { filename, content, isAsset, identity };
  });

const normalizeReferences = (content, filename, assets) =>
  content.replace(/<(script|link)\b[^>]*>/gi, (tag, tagName) => {
    const attribute = tagName.toLowerCase() === 'script' ? 'src' : 'href';
    const regexp = new RegExp(`(\\s${attribute}\\s*=\\s*)(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\x60]+))`, 'gi');

    return tag.replace(regexp, (match, prefix, doubleQuoted, singleQuoted, unquoted) => {
      const url = doubleQuoted ?? singleQuoted ?? unquoted;
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return match;

      const suffixIndex = url.search(/[?#]/);
      const pathname = suffixIndex < 0 ? url : url.slice(0, suffixIndex);
      const suffix = suffixIndex < 0 ? '' : url.slice(suffixIndex);
      const resolved = pathname.startsWith('/')
        ? path.posix.normalize(pathname.slice(1))
        : path.posix.join(path.posix.dirname(filename), pathname);
      const identity = assets.get(resolved);
      if (identity === undefined) return match;

      const quote = doubleQuoted !== undefined ? '"' : singleQuoted !== undefined ? "'" : '';
      return prefix + quote + identity + suffix + quote;
    });
  });

/**
 * Compare generated files independently of collision suffix assignment.
 *
 * Webpack processes resources asynchronously. Different source files with the
 * same basename can receive different numeric suffixes between builds:
 * script.js, script.1.js, script.2.js.
 *
 * Match JS/CSS by content within the same filename family, ignoring only the
 * numeric collision suffix. Compare identity multisets (including duplicate
 * counts) to require a one-to-one correspondence, then compare HTML strictly
 * with asset references normalized to those identities. Missing files,
 * overwritten content and incorrect page references must still fail.
 *
 * @param {string} receivedPath
 * @param {string} expectedPath
 */
export const compareOutputFilesWithUniqueNames = (receivedPath, expectedPath) => {
  const received = describeFiles(receivedPath);
  const expected = describeFiles(expectedPath);

  expect(received.map(({ identity }) => identity).sort()).toEqual(expected.map(({ identity }) => identity).sort());

  const assetIdentities = (files) =>
    new Map(files.filter(({ isAsset }) => isAsset).map(({ filename, identity }) => [filename, identity]));
  const receivedAssets = assetIdentities(received);
  const expectedAssets = assetIdentities(expected);

  for (const file of expected) {
    if (file.isAsset) continue;

    const actual = received.find(({ filename }) => filename === file.filename);
    if (file.filename.endsWith('.html')) {
      expect(normalizeReferences(actual.content.toString('utf8'), file.filename, receivedAssets)).toEqual(
        normalizeReferences(file.content.toString('utf8'), file.filename, expectedAssets)
      );
    } else {
      expect(actual.content).toEqual(file.content);
    }
  }
};

/** Compile a test case and compare files allowing numeric asset collision suffixes. */
export const compareFilesWithUniqueNames = async (relTestCasePath) => {
  const testPath = path.join(PATHS.testSource, relTestCasePath);
  await compile(PATHS, relTestCasePath, {});
  compareOutputFilesWithUniqueNames(path.join(testPath, PATHS.webRoot), path.join(testPath, PATHS.expected));
};
