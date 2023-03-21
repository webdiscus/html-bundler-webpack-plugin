const path = require('path');
const { isWin, pathToPosix } = require('./Helpers');

/**
 * Load node module.
 *
 * @param {string} name The name of node module.
 * @return {*}
 * @throws
 */
const loadModule = (name) => {
  let module;
  try {
    module = require(name);
  } catch (error) {
    const message = `Cannot find module '${name}'. Please install missing module:\nnpm i -D ${name}\n`;
    throw new Error(message);
  }

  return module;
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
const readDirRecursiveSync = (dir, { fs, includes = [], excludes = [] }) => {
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
      const fullPath = path.join(dir, file.name);

      if (noExcludes || !excludes.find((regex) => regex.test(fullPath))) {
        if (file.isDirectory()) result.push(...readDir(fullPath));
        else if (noIncludes || includes.find((regex) => regex.test(fullPath))) result.push(fullPath);
      }
    }

    return result;
  };

  return readDir(dir);
};

/**
 * Resolve a file.
 *
 * @param {string} file A file with or without extension.
 * @param {FileSystem} fs The file system. Should be used the improved Webpack FileSystem.
 * @param {string} root The root path for the file with an absolute path (e.g., /file.html)
 * @param {Array<string>} paths Resolve a file in these paths.
 * @param {Array<string>} extensions Resolve a file without an extension with these extensions.
 * @return {string|boolean} Returns resolved file otherwise returns false.
 */
const resolveFile = (file, { fs, root = process.cwd(), paths = [], extensions = [] }) => {
  const resolveFileExt = (file, extensions = []) => {
    const { ext } = path.parse(file);

    if (ext) {
      // test file
      if (fs.existsSync(file)) return file;
    } else {
      // test file.ext
      for (let extension of extensions) {
        if (!extension.startsWith('.')) extension = '.' + extension;
        let fileWithExt = file + extension;
        if (fs.existsSync(fileWithExt)) return fileWithExt;
      }
    }

    return false;
  };

  let isRoot = false;

  if (file.startsWith('/')) {
    isRoot = true;
    file = path.join(root, file);
  }

  let resolvedFile = resolveFileExt(file, extensions);

  if (resolvedFile) return resolvedFile;
  if (isRoot) return false;

  // test path/file.ext
  for (let filePath of paths) {
    if (!filePath.endsWith(path.sep)) filePath += path.sep;
    resolvedFile = resolveFileExt(filePath + file, extensions);
    if (resolvedFile) return resolvedFile;
  }

  return false;
};

/**
 * Return the path of file relative to a directory.
 *
 * @param {string} file
 * @param {string} dir
 * @return {string}
 */
const pathRelativeByPwd = (file, dir = process.cwd()) => {
  let relPath = file;

  if (file.startsWith(dir)) {
    relPath = path.relative(dir, file);
    if (!path.extname(file)) relPath = path.join(relPath, path.sep);
  }

  return isWin ? pathToPosix(relPath) : relPath;
};

module.exports = {
  loadModule,
  readDirRecursiveSync,
  resolveFile,
  pathRelativeByPwd,
};
