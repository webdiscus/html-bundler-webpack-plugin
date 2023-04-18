const fs = require('fs');
const path = require('path');

/**
 * Get files with relative paths.
 * @param {string} dir
 * @param {boolean} returnAbsolutePath If is false then return relative paths by dir.
 * @return {[]}
 */
export const readDirRecursiveSync = function (dir = './', returnAbsolutePath = true) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  dir = path.resolve(dir);

  // get files within the current directory and add a path key to the file objects
  const files = entries.filter((file) => !file.isDirectory()).map((file) => path.join(dir, file.name));
  // get folders within the current directory
  const folders = entries.filter((folder) => folder.isDirectory());

  for (const folder of folders) {
    files.push(...readDirRecursiveSync(path.join(dir, folder.name)));
  }

  return returnAbsolutePath ? files : files.map((file) => file.replace(path.join(dir, '/'), ''));
};

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
 * Copy current generated files form `dist/` to `expected/`.
 *
 * TODO: add exclude dirs contained expected/output.txt. This files must be updated manually.
 *
 * @param {string} dir The absolute path.
 * @param {string} from The relative path to the `dir`.
 * @param {string} to The relative path to the `dir`.
 */
export const syncExpected = function (dir, { from, to }) {
  if (dir === '/') return;

  // 1. remove outdated files
  const expectedDirs = readDirOnlyRecursiveSync(dir, new RegExp(`${to}$`));
  expectedDirs.forEach((current) => fs.rmSync(current, { recursive: true, force: true }));

  // 2. read all dist dirs
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const distDirs = entries.filter((folder) => folder.isDirectory());

  // 3. copy files recursively `from` to `to` path
  distDirs.forEach(({ name }) => {
    const currentDir = path.join(dir, name);
    const fromDir = path.join(currentDir, from);
    const toDir = path.join(currentDir, to);

    if (!fs.existsSync(fromDir)) {
      return;
    }

    console.log('>>> fromDir: ', { fromDir, __toDir: toDir });
    copyRecursiveSync(fromDir, toDir);
  });
};

/**
 * Return content of file as string.
 *
 * @param {string} file
 * @return {any}
 */
export const readTextFileSync = (file) => {
  if (!fs.existsSync(file)) {
    throw new Error(`\nERROR: the file "${file}" not found.`);
  }
  return fs.readFileSync(file, 'utf-8');
};
