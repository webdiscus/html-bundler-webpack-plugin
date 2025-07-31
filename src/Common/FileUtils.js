const path = require('path');
const fs = require('fs');
const { red, redBright, cyan, whiteBright, yellow } = require('ansis');
const { isWin, pathToPosix } = require('./Helpers');

/**
 * Load CJS node module synchronously.
 *
 * @param {string} moduleName The name of node module.
 * @param {function=} callback The function to load a module.
 * @param {string} context The current working directory where is the node_modules folder.
 * @return {*}
 * @throws
 */
const loadModule = (moduleName, callback = null, context = process.cwd()) => {
  let moduleFile;
  let module;

  try {
    moduleFile = require.resolve(moduleName, { paths: [context] });
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      const message =
        whiteBright`Cannot find module '${red(moduleName)}'. Please install the missing module: ${cyan`npm i -D ${moduleName}`}` +
        '\n';
      throw new Error(message);
    }
    throw error;
  }

  try {
    module = typeof callback === 'function' ? callback() : require(moduleFile);
  } catch (error) {
    throw error;
  }

  return module;
};

/**
 * @param {FileSystem} fs
 * @param {string} file
 * @return {boolean|null} Returns null if the file not exists, true if the file is directory, otherwise false.
 */
const isDir = ({ fs, file }) => {
  if (!fs.existsSync(file)) return null;

  return fs.lstatSync(file).isDirectory();
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

      if (noExcludes || !excludes.some((regex) => regex.test(current))) {
        if (file.isDirectory()) result.push(...readDir(current));
        else if (noIncludes || includes.some((regex) => regex.test(current))) result.push(current);
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
 * @return {string|false} Returns resolved file otherwise returns false.
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

  // absolute file path
  if (path.isAbsolute(file) && fs.existsSync(file)) return file;

  // root file path, relative to the project directory
  if (file.startsWith('/')) {
    isRoot = true;
    file = path.join(root, file);
  }

  let resolvedFile = resolveFileExt(file, extensions);

  if (resolvedFile) return resolvedFile;
  if (isRoot) return false;

  // test path/file.ext
  for (let filePath of paths) {
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(root, filePath);
    }

    resolvedFile = resolveFileExt(path.join(filePath, file), extensions);

    if (resolvedFile) return resolvedFile;
  }

  return false;
};

/**
 * Autodetect a root source directory.
 * Defaults, it is first-level subdirectory of a template, relative to root context.
 *
 * For example:
 * ./home.html => ./
 * ./src/home.html => ./src
 * ./src/views/home.html => ./src
 * ./app/views/home.html => ./app
 *
 * @param {string} rootContext The root path.
 * @param {string} file The file in the root context.
 * @return {string}
 */
const rootSourceDir = (rootContext, file) => {
  let srcDir = rootContext;
  let filePath = path.dirname(file);

  if (filePath.startsWith(rootContext) && srcDir !== filePath) {
    let subdir = filePath.replace(rootContext, '');
    if (isWin) subdir = pathToPosix(subdir);

    let pos = subdir.indexOf('/', 1);
    if (pos > 0) subdir = subdir.slice(0, pos);
    srcDir = path.join(rootContext, subdir);
  }

  return srcDir;
};

/**
 * Filter out only unique parent paths.
 *
 * For example:
 * /root/a/       ++ OK parent dir
 * /root/a/a1/    -- ignore sub dir
 * /root/b/b1/    ++ OK parent dir
 * /root/b/b1/b2/ -- ignore sub dir
 *
 * @param {Array<string>} paths
 * @return {Array<string>}
 */
const filterParentPaths = (paths) =>
  paths.length < 2
    ? paths
    : paths
        .sort((a, b) => a.length - b.length)
        .reduce((result, dir) => {
          if (!result.some((value) => dir.startsWith(value))) result.push(dir);
          return result;
        }, []);

/**
 * Touch the file.
 *
 * @param {string} file
 * @param {FileSystem} fs The file system. Should be used the improved Webpack FileSystem.
 * @return {Promise<unknown>}
 */
const touchAsync = (file, { fs }) => {
  return new Promise((resolve, reject) => {
    const time = new Date();
    fs.utimes(file, time, time, (err) => {
      if (err) {
        return fs.open(file, 'w', (err, fd) => {
          if (err) return reject(err);
          fs.close(fd, (err) => (err ? reject(err) : resolve(fd)));
        });
      }
      resolve();
    });
  });
};

/**
 * Touch the file.
 *
 * @param {string} file
 * @param {FileSystem} fs The file system. Should be used the improved Webpack FileSystem.
 * @return void
 */
const touch = (file, { fs }) => {
  const time = new Date();
  try {
    fs.utimesSync(file, time, time);
  } catch (err) {
    fs.closeSync(fs.openSync(file, 'w'));
  }
};

module.exports = {
  loadModule,
  isDir,
  readDirRecursiveSync,
  resolveFile,
  rootSourceDir,
  filterParentPaths,
  touchAsync,
  touch,
};
