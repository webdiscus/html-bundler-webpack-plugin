const path = require('path');

/**
 * AssetTrash.
 * Accumulate and remove junk assets from compilation.
 */

/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import('webpack-sources').ConcatSource} ConcatSource */

class AssetTrash {
  compilation = null;
  trash = new Set();
  commentRegexp = /^\/\*!.+\.LICENSE\.txt\s*\*\//;
  commentFileSuffix = '.LICENSE.txt';

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  constructor({ compilation }) {
    this.compilation = compilation;
  }

  /**
   * @param {Compilation} compilation The instance of the webpack compilation.
   */
  init(compilation) {
    this.compilation = compilation;
  }

  /**
   * Add a junk asset file to trash for lazy removing them from compilation.
   *
   * @param {string} file
   */
  add(file) {
    this.trash.add(file);
  }

  /**
   * Remove all deleted files from the compilation.
   */
  clearCompilation() {
    this.trash.forEach((file) => {
      this.compilation.deleteAsset(file);
    });

    this.reset();
  }

  /**
   * Remove files containing extracted license.
   */
  removeComments() {
    const { compilation, commentFileSuffix: suffix } = this;

    if (!compilation.assets) return;

    const { ConcatSource } = compilation.compiler.webpack.sources;
    const assets = Object.keys(compilation.assets);
    const licenseFiles = assets.filter((file) => file.endsWith(suffix));
    let licenseFilename;

    /**
     * Remove the child sources containing the license comment.
     *
     * @param {ConcatSource} concatSource
     * @return {ConcatSource}
     */
    const updateSource = (concatSource) => {
      // reserved for a fallback if in future the comment will be changed
      // const children = concatSource.getChildren().filter((child) => !this.commentRegexp.test(child.source()));
      const comment = `/*! For license information please see ${licenseFilename} */`;
      const children = concatSource.getChildren().filter((child) => !child.source().startsWith(comment));

      return new ConcatSource(...children);
    };

    for (let filename of licenseFiles) {
      const sourceFilename = filename.replace(suffix, '');
      licenseFilename = path.basename(filename);

      compilation.updateAsset(sourceFilename, updateSource);
      // immediately delete the license file, because when JS filename is hashed,
      // then at the last stage the license filename will be another
      compilation.deleteAsset(filename);
    }
  }

  /**
   * Reset settings.
   * Called before each new compilation after changes, in the serve/watch mode.
   */
  reset() {
    this.trash.clear();
  }
}

module.exports = AssetTrash;
