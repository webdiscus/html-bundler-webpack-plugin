// noinspection DuplicatedCode

const path = require('path');
const { isWin, pathToPosix } = require('./Helpers');
const { pluginName } = require('../config');

// string containing the '/node_modules/'
const nodeModuleDirname = path.sep + 'node_modules' + path.sep;
const testDirname = path.sep + path.join(pluginName, 'test') + path.sep;
const srcDirname = path.sep + path.join(pluginName, 'src') + path.sep;

/**
 * Load node module.
 *
 * @param {string} name The name of node module.
 * @param {function=} callback The function to load a module.
 * @return {*}
 * @throws
 */
const loadModule = (name, callback) => {
  let module;
  try {
    module = typeof callback === 'function' ? callback() : require(name);
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
 * @param {FileSystem|fs} fs The file system. Should be used the improved Webpack FileSystem.
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
 * Return the path of the file relative to a directory.
 *
 * Note: this is not a true relative path, this path is for viewing information only.
 *
 * @param {string} file
 * @param {string} dir
 * @return {string}
 */
const relativePathForView = (file, dir = process.cwd()) => {
  let relFile = file;

  if (!path.isAbsolute(file)) {
    file = path.join(dir, file);
  }

  if (file.startsWith(dir)) {
    relFile = path.relative(dir, file);
  } else if (process.env?.NODE_ENV_TEST === 'true') {
    // for test only:
    // get the relative path to the test directory, because on another machine the absolute path is different
    const testDirnamePos = file.indexOf(testDirname);
    const srcDirnamePos = file.indexOf(srcDirname);
    if (testDirnamePos > 0) {
      return '~' + file.slice(testDirnamePos + testDirname.length);
    } else if (srcDirnamePos > 0) {
      return '~' + file.slice(srcDirnamePos + 1);
    }
  }

  // extract the node module path
  const nodeModulePos = relFile.indexOf(nodeModuleDirname);
  if (nodeModulePos > 0) {
    relFile = relFile.slice(nodeModulePos + nodeModuleDirname.length);
  }

  if (!path.extname(file)) relFile = path.join(relFile, path.sep);

  return isWin ? pathToPosix(relFile) : relFile;
};

module.exports = {
  loadModule,
  readDirRecursiveSync,
  resolveFile,
  relativePathForView,
};
