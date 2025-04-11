const path = require('path');
const { cyan, yellow } = require('ansis');
const { fileExistsAsync } = require('./Utils');
const nativeEsmLoader = require('./Module/moduleLoader');

// Register the custom module loader to read real data w/o cache from changed ESM files.
// It is required for using loadModuleAsync() by serv/watch mode.
// const registerLoader = require('./Module/register');
// registerLoader();

/**
 * Load a CommonJS or ESM module.
 *
 * Note: If the loaded file or any of its dependencies change, the updated data will be reflected.
 *
 * @param {string} filePath Relative or absolute path to the module file.
 * @returns {Promise<any>} The exported module.
 */
function loadModuleAsync(filePath) {
  const absolutePath = path.resolve(filePath);
  const ext = path.extname(absolutePath).toLowerCase();

  const loadEsm = (filePath) =>
    nativeEsmLoader(filePath).then((module) => {
      // handle ESM file that has the .js extension
      if (module && module.__esModule === true && typeof module.default === 'object') {
        module = module.default;
      }

      return module?.default ?? module;
    });

  return fileExistsAsync(absolutePath).then((exists) => {
    if (!exists) {
      throw new Error(`File not found: ${cyan(absolutePath)}`);
    }

    if (ext === '.mjs') {
      return loadEsm(absolutePath);
    }

    if (ext === '.cjs' || ext === '.json' || ext === '.js') {
      try {
        const module = require(absolutePath);
        return module.default ?? module;
      } catch (error) {
        if (error.code === 'ERR_REQUIRE_ESM') {
          // fallback to ESM
          return loadEsm(absolutePath);
        }
        throw error;
      }
    }

    throw new Error(
      `Unsupported file type: ${cyan`${ext}`}\nSupported module extensions: ${yellow`.js, .cjs, .mjs, .json`}`
    );
  });
}

module.exports = {
  loadModuleAsync,
};
