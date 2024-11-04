const { resolveFile } = require('../../../../Common/FileUtils');

/** @typedef {import('tempura')} Tempura */

/**
 * Return the include helper function.
 *
 * @param {Tempura} Tempura The instance of Tempura module.
 * @param {FileSystem} fs The file system.
 * @param {string} root The root path to template partials.
 * @param {Array<string>} views The paths of including partials.
 * @param {Array<string>} extensions The default extensions of including partials.
 * @param {{}} option
 * @return {function(args: Object): string}
 */
module.exports = ({ Tempura, fs, root, views = [], extensions = [], options = {} }) => {
  /**
   * Include the partial file in a template.
   *
   * @param {string} src The partial file name.
   * @return {string}
   */
  return ({ src: filename }) => {
    const file = resolveFile(filename, { fs, root, paths: views, extensions });
    let data = options?._data || {};

    if (!file) {
      throw new Error(`Could not find the include file '${filename}'`);
    }

    const template = fs.readFileSync(file, 'utf8');

    return Tempura.compile(template, options)(data);
  };
};
