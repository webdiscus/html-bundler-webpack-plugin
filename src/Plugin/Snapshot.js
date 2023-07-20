const { readDirRecursiveSync } = require('../Common/FileUtils');

/**
 * Snapshot of files.
 *
 * This module supports the detection of file name changes: add/delete/rename files in the directory.
 * File content change detection is not supported.
 *
 * Used in watch mode to compare the file's list before and after changes in a directory.
 */

class Snapshot {
  static fs = null;
  static dirs = [];
  static includes = [];
  static excludes = [];

  static prevFiles = [];
  static currFiles = [];
  static missingFiles = new Map();

  /**
   *
   * @param {FileSystem} fs
   * @param {string|Array<string>} dir The directory for snapshot.
   * @param {Array<RegExp>} includes The filter to read only matched files.
   * @param {Array<RegExp>} excludes The filter to ignore matched files.
   */
  static init({ fs, dir, includes = [], excludes = [/[\\/]nod_modules[\\/]/] }) {
    this.fs = fs;
    this.dirs = Array.isArray(dir) ? dir : [dir];
    this.includes = includes;
    this.excludes = excludes;
  }

  /**
   * Create snapshot of files in the directory.
   */
  static create() {
    const { fs, dirs, includes, excludes } = this;
    const hasPrevFiles = this.prevFiles.length > 0;

    if (hasPrevFiles) {
      this.prevFiles = [...this.currFiles];
    }

    this.currFiles = [];

    for (const dir of dirs) {
      const files = readDirRecursiveSync(dir, { fs, includes, excludes });

      this.currFiles.push(...files);
    }

    if (!hasPrevFiles) {
      this.prevFiles = [...this.currFiles];
    }
  }

  /**
   * Get the list of old file names which are changed.
   *
   * @return {Array}
   */
  static getOldFiles() {
    return this.getDiff(this.prevFiles, this.currFiles);
  }

  /**
   * Get the list of new file names which are changed.
   *
   * @return {Array}
   */
  static getNewFiles() {
    return this.getDiff(this.currFiles, this.prevFiles);
  }

  /**
   * Detect the action type by file manipulation.
   *
   * Limitation: currently supports for change only a single file.
   *
   * TODO: fix when added/removed many files, then Webpack calls many times the `invalid` hook for each file,
   *   in this case only for first calling of `invalid` hook the action type is correct - add/remove,
   *   for next calls is detected no changes, because the snapshot take current state of dir
   *
   * @return {{oldFileName: string, newFileName: string, actionType: string}}
   */
  static detectFileChange() {
    const oldFiles = this.getOldFiles();
    const newFiles = this.getNewFiles();
    const hasOldFiles = oldFiles.length > 0;
    const hasNewFiles = newFiles.length > 0;

    let actionType = '';
    let oldFileName = '';
    let newFileName = '';

    if (!hasOldFiles && hasNewFiles) {
      // a file is created in the directory or coped/removed into the directory
      actionType = 'add';
      newFileName = newFiles[0];
    } else if (hasOldFiles && !hasNewFiles) {
      // a file is deleted or removed outer the directory
      actionType = 'remove';
      oldFileName = oldFiles[0];
    } else if (hasOldFiles && hasNewFiles) {
      // a file is renamed in the directory
      actionType = 'rename';
      oldFileName = oldFiles[0];
      newFileName = newFiles[0];
    } else if (!hasOldFiles && !hasNewFiles) {
      // a file content is modified
      actionType = 'modify';
    }

    return { actionType, oldFileName, newFileName };
  }

  static getMissingFiles() {
    return this.missingFiles;
  }

  static addMissingFile(issuer, file) {
    let files = this.missingFiles.get(issuer);

    if (!files) this.missingFiles.set(issuer, new Set([file]));
    else files.add(file);
  }

  static deleteMissingFile(issuer, file) {
    let files = this.missingFiles.get(issuer);

    if (files) files.delete(file);
    if (files.size === 0) this.missingFiles.delete(issuer);
  }

  static hasMissingFile(issuer, file) {
    let files = this.missingFiles.get(issuer);
    if (!files) return false;

    return !!Array.from(files).find((missingFile) => file.endsWith(missingFile));
  }

  static getDiff(a, b) {
    return a.filter((x) => !b.includes(x));
  }

  static reset() {}

  static clear() {
    this.prevFiles.length = 0;
    this.currFiles.length = 0;
  }
}

module.exports = Snapshot;
