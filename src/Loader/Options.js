const path = require('path');
const Preprocessor = require('./Preprocessor');
const PluginService = require('../Plugin/PluginService');
const { parseQuery } = require('../Common/Helpers');
const { rootSourceDir, filterParentPaths } = require('../Common/FileUtils');
const { watchPathsException, dataFileNotFoundException, dataFileException } = require('./Messages/Exeptions');

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
  static #watch;
  static #webpackOptions;
  static #options;
  static #rootContext;
  static #resourcePath;

  // TODO: add compile|compiling, render|rendering and string|html modes;
  static modes = new Set(['render']);

  static init(loaderContext) {
    const { loaderIndex, rootContext, resourcePath, resourceQuery } = loaderContext;
    const loaderObject = loaderContext.loaders[loaderIndex];
    const loaderId = loaderObject.path + loaderObject.query;
    const queryData = parseQuery(resourceQuery);
    let options = PluginService.getLoaderCache(loaderId);

    this.fileSystem = loaderContext.fs.fileSystem;
    this.#watch = PluginService.isWatchMode();
    this.#webpackOptions = loaderContext._compiler.options || {};
    this.#rootContext = rootContext;
    this.#resourcePath = resourcePath;

    if (!options) {
      const loaderOptions = PluginService.getLoaderOptions();
      options = { ...loaderOptions, ...(loaderContext.getOptions() || {}) };

      // the assets root path is used for resolving files specified in attributes (`sources` option)
      // allow both 'root' and 'basedir' option name for compatibility
      const basedir = options.root || options.basedir || false;
      options.basedir = basedir && basedir.slice(-1) !== path.sep ? basedir + path.sep : basedir;

      // reserved for future feature
      // if (queryData.hasOwnProperty('_mode')) {
      //   // rule: the mode defined in the query has prio over the loader option
      //   if (this.modes.has(queryData._mode)) {
      //     options.mode = queryData._mode;
      //   }
      //   // remove mode from query data to pass in the template only clean data
      //   delete queryData['_mode'];
      // }

      PluginService.setLoaderCache(loaderId, options);
    }
    this.#options = options;

    // if the data option is a string, it must be an absolute or relative filename of an existing file that exports the data
    const loaderData = this.loadData(options.data);
    const entryData = this.loadData(loaderContext.entryData);

    // merge plugin and loader data, the plugin data property overrides the same loader data property
    const data = { ...loaderData, ...entryData, ...queryData };
    if (Object.keys(data).length > 0) loaderObject.data = data;

    // beforePreprocessor
    if (typeof options.beforePreprocessor !== 'function') {
      options.beforePreprocessor = null;
    }

    // preprocessor
    if (!Preprocessor.isReady(options.preprocessor)) {
      options.preprocessor = Preprocessor.factory(loaderContext, {
        preprocessor: options.preprocessor,
        watch: this.#watch,
        options: options.preprocessorOptions,
      });
    }

    // clean loaderContext of artifacts
    if (loaderContext.entryData != null) delete loaderContext.entryData;

    // defaults, cacheable is true, the loader option is not documented in readme, use it only for debugging
    if (loaderContext.cacheable != null) loaderContext.cacheable(options?.cacheable !== false);

    if (this.#watch) this.#initWatchFiles();
  }

  static #initWatchFiles() {
    const watchFiles = {
      // watch files only in the directories;
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
    const watchDirs = new Set([rootSourceDir(this.#rootContext, this.#resourcePath)]);
    const rootContext = this.#rootContext;

    // add to watch paths defined in options of a template engine
    let { root, views, partials } = this.#options?.preprocessorOptions || {};
    let dirs = [];

    [paths, root, views, partials].forEach((item) => {
      if (item) {
        if (typeof item === 'string') dirs.push(item);
        else if (Array.isArray(item)) dirs.push(...item);
      }
    });

    for (let dir of dirs) {
      const watchDir = path.isAbsolute(dir) ? dir : path.join(rootContext, dir);
      if (!fs.existsSync(watchDir)) {
        watchPathsException(watchDir, paths);
      }
      watchDirs.add(watchDir);
    }

    // parent watch directories, all paths with subdirectories are ignored
    watchFiles.paths = filterParentPaths(Array.from(watchDirs));

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
   * @param {Object|string|null} dataValue If string, the relative or absolute filename.
   * @return {Object}
   */
  static loadData(dataValue) {
    if (typeof dataValue !== 'string') return dataValue || {};

    let dataFile = PluginService.dataFiles.get(dataValue);

    if (!dataFile) {
      const fs = this.fileSystem;
      dataFile = path.isAbsolute(dataValue) ? dataValue : path.join(process.cwd(), dataValue);

      if (!fs.existsSync(dataFile)) {
        dataFileNotFoundException(dataFile);
      }
      PluginService.dataFiles.set(dataValue, dataFile);
    }

    let data;
    try {
      data = require(dataFile);
    } catch (error) {
      dataFileException(error, dataFile);
    }

    return data || {};
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
   * @return {string|false}
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
      { tag: 'use', attributes: ['href', 'xlink:href'] }, // <svg><use href="icons.svg#home"></use></svg>
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

  static getCustomWatchFiles() {
    return Array.from(PluginService.dataFiles.values());
  }

  /**
   * Returns preprocessor to compile a template.
   * The default preprocessor uses the Eta templating engine.
   *
   * @return {null|(function(string, {data?: {}}): Promise|null)}
   */
  static getPreprocessor() {
    return Preprocessor.getPreprocessor(this.#options);
  }

  static getWatchFiles() {
    return this.#watchFiles;
  }

  static getWatchPaths() {
    return this.#watchFiles.paths;
  }

  static getWebpackResolve() {
    return this.#webpackOptions.resolve || {};
  }
}

module.exports = Options;
