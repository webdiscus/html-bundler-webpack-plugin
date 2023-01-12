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

/**
 * Return content of file as string.
 *
 * @param {string} file
 * @return {any}
 */
export const readTextFileSync = (file) => {
  if (!fs.existsSync(file)) {
    console.log(`\nWARN: the file "${file}" not found.`);
    return '';
  }
  return fs.readFileSync(file, 'utf-8');
};