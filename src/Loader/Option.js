const path = require('path');
const Preprocessor = require('./Preprocessor');
const PluginService = require('../Plugin/PluginService');
const { parseQuery } = require('../Common/Helpers');
const { rootSourceDir, filterParentPaths } = require('../Common/FileUtils');
const { findRootIssuer } = require('../Common/CompilationHelpers');
const { watchPathsException, dataFileNotFoundException, dataFileException } = require('./Messages/Exeptions');

/**
 * @typedef OptionSources
 * @property {string} tag
 * @property {Array<string>?} attributes
 * @property {Function?} filter
 */

class Option {
  /** The file system used by Webpack */
  static fileSystem = null;
  static #watchFiles = {};
  static #watch;
  static #webpackOptions;
  static #options;
  static #rootContext;
  static #resourcePath;
  static #pluginOption;

  // rule: the first value is default
  static preprocessorModes = new Set(['render', 'compile']);

  static init(loaderContext) {
    const { loaderIndex, rootContext, resourcePath, resourceQuery } = loaderContext;
    // note: the loaderContext object has only getter for the `data` property
    const loaderObject = loaderContext.loaders[loaderIndex];
    const loaderId = loaderObject.path + loaderObject.query;
    const queryData = parseQuery(resourceQuery);
    let options = PluginService.getLoaderCache(loaderId);

    this.#pluginOption = PluginService.getOptions();
    this.#watch = PluginService.isWatchMode();
    this.fileSystem = loaderContext.fs.fileSystem;
    this.#webpackOptions = loaderContext._compiler.options || {};
    this.#rootContext = rootContext;
    this.#resourcePath = resourcePath;

    if (!options) {
      const loaderOptions = PluginService.getLoaderOptions();
      options = { ...loaderOptions, ...(loaderContext.getOptions() || {}) };

      // save the initial value defined in the webpack config
      options.originalPreprocessorMode = options.preprocessorMode;

      // the assets root path is used for resolving files specified in attributes (`sources` option)
      // allow both 'root' and 'basedir' option name for compatibility
      const basedir = options.root || options.basedir || false;
      options.basedir = basedir && basedir.slice(-1) !== path.sep ? basedir + path.sep : basedir;

      // whether it should be used ESM export for the rendered/compiled result
      options.esModule = options?.esModule === true;

      PluginService.setLoaderCache(loaderId, options);
    }
    this.#options = options;

    // if the data option is a string, it must be an absolute or relative filename of an existing file that exports the data
    const loaderData = this.#loadData(options.data);
    const entryData = this.#loadData(loaderContext.entryData);
    const contextData = loaderContext.data || {};

    // merge plugin and loader data, the plugin data property overrides the same loader data property
    loaderObject.data = { ...contextData, ...loaderData, ...entryData, ...queryData };

    // beforePreprocessor
    if (typeof options.beforePreprocessor !== 'function') {
      options.beforePreprocessor = null;
    }

    // preprocessor
    this.#initPreprocessor(loaderContext, queryData);

    // clean loaderContext of artifacts
    if (loaderContext.entryData != null) delete loaderContext.entryData;

    // defaults, cacheable is true, the loader option is not documented in readme, use it only for debugging
    if (loaderContext.cacheable != null) loaderContext.cacheable(options?.cacheable !== false);

    if (this.#watch) this.#initWatchFiles();
  }

  /**
   * @param {BundlerPluginLoaderContext} loaderContext The loader context of Webpack.
   * @param {Object} queryData The parsed parameters from the url query.
   */
  static #initPreprocessor(loaderContext, queryData) {
    const pluginOption = this.#pluginOption;
    const options = this.#options;
    const issuer = loaderContext._module.resourceResolveData?.context?.issuer || '';
    let [defaultPreprocessorMode] = this.preprocessorModes;
    let isIssuerScript = false;
    let preprocessorMode;

    if (issuer) {
      isIssuerScript = pluginOption.isScript(issuer);
      if (!isIssuerScript) {
        const rootIssuer = findRootIssuer(PluginService.compilation, issuer);
        if (rootIssuer) {
          isIssuerScript = pluginOption.isScript(rootIssuer);
        }
      }
    }

    // rule: defaults, if issuer is JS, then compile template to the template function
    if (isIssuerScript) {
      preprocessorMode = defaultPreprocessorMode = 'compile';
    }

    // rule: a mode defined in the query using `?render` or `?compile` has the priority over the default or loaderOptions value
    for (let mode of this.preprocessorModes) {
      if (mode in queryData) {
        preprocessorMode = mode;
        delete queryData[mode];
        break;
      }
    }

    // reset the original option value, also no cached state,
    // because the loader works in different modes depend on the context
    options.preprocessorMode = options.originalPreprocessorMode;

    if (preprocessorMode && this.preprocessorModes.has(preprocessorMode)) {
      options.preprocessorMode = preprocessorMode;
    } else if (!this.preprocessorModes.has(options.preprocessorMode)) {
      options.preprocessorMode = defaultPreprocessorMode;
    }

    if (!Preprocessor.isUsed(options.preprocessor)) {
      options.preprocessor = Preprocessor.factory(loaderContext, {
        preprocessor: options.preprocessor,
        options: options.preprocessorOptions,
        watch: this.#watch,
      });
    }
  }

  static #initWatchFiles() {
    const pluginOption = this.#pluginOption;
    const watchFiles = {
      // watch files only in the directories;
      // defaults is first-level subdirectory of a template, relative to root context
      paths: [],

      // watch only files matched to RegExps,
      // if empty then watch all files, except ignored
      files: pluginOption.getEntryTest(),

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
    const { paths, files, ignore } = pluginOption.getWatchFiles();
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
  static #loadData(dataValue) {
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

module.exports = Option;
