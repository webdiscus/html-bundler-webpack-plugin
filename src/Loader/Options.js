const Eta = require('eta');
const path = require('path');
const PluginService = require('../Plugin/PluginService');
const { isWin, pathToPosix } = require('../Common/Helpers');
const { watchPathsException } = require('./Messages/Exeptions');

/**
 * @typedef OptionSources
 * @property {string} tag
 * @property {Array<string>?} attributes
 * @property {Function?} filter
 */

class Options {
  /** The file system used by Webpack */
  static fileSystem = null;
  static #watchFiles = {};
  static #webpackOptions;
  static #options;
  static #rootContext;
  static #resourcePath;

  static init(loaderContext) {
    const { rootContext, resourcePath } = loaderContext;
    const options = { ...PluginService.getLoaderOptions(), ...(loaderContext.getOptions() || {}) };

    this.fileSystem = loaderContext.fs.fileSystem;
    this.#webpackOptions = loaderContext._compiler.options || {};
    this.#options = options;
    this.#rootContext = rootContext;
    this.#resourcePath = resourcePath;

    // TODO (sourcePath option is experimental, reserved for future):
    // basedir, allow to configure assets root path used for resolving files specified in attributes (`sources` option)
    let sourcePath = options.sourcePath != null ? options.sourcePath : rootContext;
    this.#options.basedir = sourcePath.slice(-1) === path.sep ? sourcePath : sourcePath + path.sep;

    this.#initWatchFiles();

    // defaults, cacheable is true, the loader option is not documented in readme, use it only for debugging
    if (loaderContext.cacheable != null) loaderContext.cacheable(this.#options?.cacheable !== false);
  }

  /**
   * Returns original loader options.
   *
   * @return {{}}
   */
  static get() {
    return this.#options;
  }

  /**
   * Returns the root directory for the paths in template starting with `/`.
   * @return {string}
   */
  static getBasedir() {
    return this.#options.basedir;
  }

  /**
   * Returns the list of tags and attributes where source files should be resolved.
   *
   * @return {Array<OptionSources>|false}
   */
  static getSources = () => {
    const { sources } = this.#options;

    if (sources === false) return false;

    // default tags and attributes for resolving resources
    const defaultSources = [
      { tag: 'link', attributes: ['href', 'imagesrcset'] }, // 'imagesrcset' if rel="preload" and as="image"
      { tag: 'script', attributes: ['src'] },
      { tag: 'img', attributes: ['src', 'srcset'] },
      { tag: 'image', attributes: ['href', 'xlink:href'] }, // <svg><image href="image.png"></image></svg>
      { tag: 'use', attributes: ['href'] }, // <svg><use href="icons.svg#home"></use></svg>
      { tag: 'input', attributes: ['src'] }, // type="image"
      { tag: 'source', attributes: ['src', 'srcset'] },
      { tag: 'audio', attributes: ['src'] },
      { tag: 'track', attributes: ['src'] },
      { tag: 'video', attributes: ['src', 'poster'] },
      { tag: 'object', attributes: ['data'] },
    ];

    if (!Array.isArray(sources)) return defaultSources;

    for (const item of sources) {
      const source = defaultSources.find(({ tag }) => tag === item.tag);
      if (source) {
        if (item.attributes) {
          for (let attr of item.attributes) {
            // add only unique attributes
            if (source.attributes.indexOf(attr) < 0) source.attributes.push(attr);
          }
        }
        if (typeof item.filter === 'function') {
          source.filter = item.filter;
        }
      } else {
        defaultSources.push(item);
      }
    }

    return defaultSources;
  };

  /**
   * Returns preprocessor.
   * Note: the default preprocessor use the Eta templating engine.
   *
   * @return {null|(function(string, {data?: {}}): Promise|string|null)}
   */
  static getPreprocessor() {
    if (typeof this.#options.preprocessor === 'function') {
      return this.#options.preprocessor;
    }

    if (this.#options.preprocessor !== false) {
      const config = {
        // defaults async is false, because the `includeFile()` function is sync,
        // wenn async is true then must be used `await includeFile()`
        async: false,
        useWith: true, // allow to use variables in template without `it.` scope
        root: this.#rootContext,
      };

      return (template, { data = {} }) => Eta.render(template, data, config);
    }

    return null;
  }

  static getWatchFiles() {
    return this.#watchFiles;
  }

  static getWebpackResolve() {
    return this.#webpackOptions.resolve || {};
  }

  static #initWatchFiles() {
    if (!PluginService.isWatchMode()) return;

    const watchFiles = {
      // watch files only in the directories,
      // defaults is first-level subdirectory of a template, relative to root context
      paths: [],

      // watch only files matched to RegExps,
      // if empty then watch all files, except ignored
      files: [PluginService.getOptions().getFilterRegexp()],

      // ignore paths and files matched to RegExps
      ignore: [
        /[\\/](node_modules|dist|test)$/, // dirs
        /[\\/]\..+$/, // hidden dirs and files: .git, .idea, .gitignore, etc.
        /package(?:-lock)*\.json$/,
        /webpack\.(.+)\.js$/,
        /\.(je?pg|png|ico|gif|webp|svg|woff2?|ttf|otf|eot)$/,
      ],
    };

    const fs = this.fileSystem;
    const { paths, files, ignore } = PluginService.getOptions().getWatchFiles();
    const watchDirs = new Set([this.#autodetectWatchPath()]);
    const rootContext = this.#rootContext;

    if (paths) {
      const entries = Array.isArray(paths) ? paths : [paths];
      for (let watchDir of entries) {
        const dir = path.isAbsolute(watchDir) ? watchDir : path.join(rootContext, watchDir);
        if (!fs.existsSync(dir)) {
          watchPathsException(dir, paths);
        }
        watchDirs.add(dir);
      }
    }
    // set the list of unique watch directories
    watchFiles.paths = Array.from(watchDirs);

    if (files) {
      const entries = Array.isArray(files) ? files : [files];
      for (let item of entries) {
        if (item.constructor.name !== 'RegExp') {
          item = new RegExp(item);
        }
        watchFiles.files.push(item);
      }
    }

    if (ignore) {
      const entries = Array.isArray(ignore) ? ignore : [ignore];
      for (let item of entries) {
        if (item.constructor.name !== 'RegExp') {
          item = new RegExp(item);
        }
        watchFiles.ignore.push(item);
      }
    }

    this.#watchFiles = watchFiles;
  }

  /**
   * Autodetect a watch directory.
   * Defaults, it is first-level subdirectory of a template, relative to root context.
   *
   * For examples:
   * ./home.html => ./
   * ./src/home.html => ./src
   * ./src/views/home.html => ./src
   * ./app/views/home.html => ./app
   *
   * @return {string}
   * @private
   */
  static #autodetectWatchPath() {
    let watchPath = this.#rootContext;
    let filePath = path.dirname(this.#resourcePath);

    if (filePath.startsWith(this.#rootContext) && watchPath !== filePath) {
      let subdir = filePath.replace(this.#rootContext, '');
      if (isWin) subdir = pathToPosix(subdir);

      let pos = subdir.indexOf('/', 1);
      if (pos > 0) subdir = subdir.slice(0, pos);
      watchPath = path.join(this.#rootContext, subdir);
    }

    return watchPath;
  }
}

module.exports = Options;
