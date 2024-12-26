const fs = require('fs');
const path = require('path');

/**
 * Get directories only.
 * @param {string} dir
 * @param {RegExp} test Include dirs matching this RegExp.
 * @return {[]}
 */
export const readDirOnlyRecursiveSync = function (dir = './', test = null) {
  dir = path.resolve(dir);

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const folders = entries.filter((folder) => folder.isDirectory());
  const result = [];

  for (const folder of folders) {
    const current = path.join(dir, folder.name);
    if (!test || test.test(current)) result.push(current);
    result.push(...readDirOnlyRecursiveSync(current, test));
  }

  return result;
};

/**
 * Returns a list of absolut files.
 *
 * @param {string} dir The starting directory.
 * @param {FileSystem} fs The file system. Should be used the improved Webpack FileSystem.
 * @param {Array<RegExp>} includes Include matched files only.
 * @param {Array<RegExp>} excludes Exclude matched files. It has priority over includes.
 * @return {Array<string>}
 */
export const readDirRecursiveSync = (dir, { includes = [], excludes = [] } = {}) => {
  const noIncludes = includes.length < 1;
  const noExcludes = excludes.length < 1;

  /**
   * @param {string} dir
   * @return {Array<string>}
   */
  const readDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const result = [];

    for (const file of entries) {
      const current = path.join(dir, file.name);

      if (noExcludes || !excludes.find((regex) => regex.test(current))) {
        if (file.isDirectory()) result.push(...readDir(current));
        else if (noIncludes || includes.find((regex) => regex.test(current))) result.push(current);
      }
    }

    return result;
  };

  return readDir(dir);
};

/**
 * Copy recursive, like as `cp -R`.
 * @param {string} src The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
export const copyRecursiveSync = function (src, dest) {
  if (!fs.existsSync(src)) throw new Error(`The source '${src}' not found!`);

  let stats = fs.statSync(src),
    isDirectory = stats.isDirectory();

  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((dir) => {
      copyRecursiveSync(path.join(src, dir), path.join(dest, dir));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

export const removeDirsSync = function (dir, test) {
  if (dir === '/') return;

  const dirs = readDirOnlyRecursiveSync(dir, test);
  dirs.forEach((current) => fs.rmSync(current, { recursive: true, force: true }));
};

/**
 * Return content of file as string.
 *
 * @param {string} file
 * @param {string} encoding
 * @return {any}
 */
export const readTextFileSync = (file, encoding = 'utf-8') => {
  if (!fs.existsSync(file)) {
    throw new Error(`\nERROR: the file "${file}" not found.`);
  }
  return fs.readFileSync(file, encoding);
};

/**
 * Copy current generated files from `dist/` to `expected/`.
 *
 * @param {string} dir The absolute path.
 */
export const syncExpected = function (dir) {
  if (dir === '/') return;

  const dirMap = new Map();

  // 1. read files
  const dirs = readDirRecursiveSync(dir, {
    fs,
    // match the path containing the `/expected` directory
    includes: [/expected\/(?:.+?)(?:[^/]+)$/],
  });

  dirs.forEach((current) => {
    const toDir = path.dirname(current);
    const testDir = path.dirname(toDir);
    const fromDir = path.join(testDir, 'dist');

    if (fs.existsSync(fromDir)) {
      // distinct the same directories
      dirMap.set(fromDir, toDir);
    }
  });

  dirMap.forEach((toDir, fromDir) => {
    console.log({ from: fromDir, __to: toDir });
    // 2. remove old files
    fs.rmSync(toDir, { recursive: true, force: true });
    // 3. copy files recursively
    copyRecursiveSync(fromDir, toDir);
  });
};
