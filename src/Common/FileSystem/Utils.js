const fs = require('fs');

/**
 * Check whether the file exists.
 *
 * @param {string} file The file path.
 * @return {Promise<boolean>}
 */
function fileExistsAsync(file) {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

module.exports = {
  fileExistsAsync,
};
