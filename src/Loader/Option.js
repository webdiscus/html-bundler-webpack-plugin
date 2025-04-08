const path = require('path');
const PluginService = require('../Plugin/PluginService');
const { parseQuery, outToConsole } = require('../Common/Helpers');
const { rootSourceDir, filterParentPaths, fileExistsAsync, loadModuleAsync } = require('../Common/FileUtils');
const { findRootIssuer } = require('../Common/CompilationHelpers');
const { getDataFileNotFoundException, getDataFileException } = require('./Messages/Exeptions');
const {
  watchPathsWarning,
  watchFilesOptionFilesDeprecation,
  watchIgnoreOptionIgnoreDeprecation,
} = require('./Messages/Warnings');

/**
 * @typedef OptionSources
 * @property {string} tag
 * @property {Array<string>?} attributes
 * @property {Function?} filter
 */

/**
 * Loader Option.
 */

class Option {
  /** The file system used by Webpack */
  fileSystem = null;
  pluginCompiler = null;
  #watchFiles = {};
  #watch;
  #webpackOptions;
  #options;
  #rootContext;
  #resourcePath;
  #pluginOption;
  #queryData;

  // rule: the first value is default
  preprocessorModes = new Set(['render', 'compile']);
  #preprocessorModule;

  constructor() {}

  init(loaderContext) {
    const { loaderIndex, rootContext, resourcePath, resourceQuery } = loaderContext;
    this.pluginCompiler = loaderContext._compilation.compiler;

    // note: the loaderContext object has only getter for the `data` property
    const loaderObject = loaderContext.loaders[loaderIndex];
    const loaderId = loaderObject.path + loaderObject.query;
    this.#queryData = parseQuery(resourceQuery);

    // using the cache avoids double initialisations of the same modules with the same options
    const loaderCache = PluginService.getLoaderCache(this.pluginCompiler, loaderId);
    let options;
    let preprocessorModule;

    this.fileSystem = loaderContext.fs.fileSystem;
    this.#pluginOption = PluginService.getOptions(this.pluginCompiler);
    this.#watch = PluginService.isWatchMode(this.pluginCompiler);
    this.#webpackOptions = loaderContext._compiler.options || {};
    this.#rootContext = rootContext;
    this.#resourcePath = resourcePath;

    if (!loaderCache) {
      const loaderOptions = PluginService.getLoaderOptions(this.pluginCompiler);
      options = { ...loaderOptions, ...(loaderContext.getOptions() || {}) };
      preprocessorModule = {};

      // basedir option
      const loaderOptionsBasedir = this.#getBaseDirFromOptions(options);
      const preprocessorOptionsBasedir = this.#getBaseDirFromOptions(loaderOptions.preprocessorOptions);

      // rule: the loader root/basedir option override the preprocessor root/basedir option
      options.basedir = loaderOptionsBasedir || preprocessorOptionsBasedir || false;

      // rule: the absolute path to all assets,
      // it works like the `root` option, but for assets w/o leading `/` slash, e.g. "images/logo.png"
      options.contextDir = loaderOptions.context || '';

      // whether it should be used ESM export for the rendered/compiled result
      options.esModule = options?.esModule === true;

      // set reference to sources defined directly in plugin options
      if (this.#pluginOption.options?.sources != null) {
        options.sources = this.#pluginOption.options.sources;
      }

      PluginService.setLoaderCache(this.pluginCompiler, loaderId, {
        options,
        preprocessorModule,
      });
    } else {
      options = loaderCache.options;
      preprocessorModule = loaderCache.preprocessorModule;
    }

    this.#options = options;
    this.#preprocessorModule = preprocessorModule;
    this.#initPreprocessor(loaderContext);

    const promises = [options.data, loaderContext.entryData, this.#queryData].map((file) => this.#loadData(file));

    return Promise.all(promises)
      .then(([pluginData, loaderData, queryData]) => {
        const contextData = loaderContext.data || {};

        // merge plugin and loader data; plugin data overrides same keys in loader data
        loaderObject.data = {
          ...contextData, // inner data
          ...pluginData, // data plugin option (global data available in all templates)
          ...loaderData, // entry data option (template specifically data)
          ...queryData, // data URL query
        };

        // normalize beforePreprocessor option
        if (typeof options.beforePreprocessor !== 'function') {
          options.beforePreprocessor = null;
        }

        // clean up loaderContext
        if (loaderContext.entryData != null) {
          delete loaderContext.entryData;
        }

        // apply cacheable flag; it's not documented, use it only for debugging
        if (loaderContext.cacheable != null) {
          loaderContext.cacheable(options?.cacheable !== false);
        }

        return loaderObject.data; // (optional: useful if caller wants the result)
      })
      .catch((err) => {
        // display own errors so as not to block subsequent actions
        outToConsole(err);
      });
  }

  #initPreprocessor(loaderContext) {
    const queryData = this.#queryData;
    const options = this.#options;
    const issuer = loaderContext._module.resourceResolveData?.context?.issuer || '';

    let [defaultPreprocessorMode] = this.preprocessorModes;
    let isIssuerScript = false;
    let preprocessorMode;

    if (issuer) {
      isIssuerScript = this.#pluginOption.isScript(issuer);
      if (!isIssuerScript) {
        const rootIssuer = findRootIssuer(loaderContext._compilation, issuer);
        if (rootIssuer) {
          isIssuerScript = this.#pluginOption.isScript(rootIssuer);
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

    if (preprocessorMode && this.preprocessorModes.has(preprocessorMode)) {
      options.preprocessorMode = preprocessorMode;
    } else if (!this.preprocessorModes.has(options.preprocessorMode)) {
      options.preprocessorMode = defaultPreprocessorMode;
    }
  }

  /**
   * The root path is used for resolving files specified in attributes (`sources` option).
   *
   * Note: the `root` and `basedir` options are synonym, no difference.
   *
   * @param {{}} options
   * @return {string|boolean}
   */
  #getBaseDirFromOptions(options) {
    if (!options) return false;

    let basedir = options.root || options.basedir || false;

    return basedir && basedir.slice(-1) !== path.sep ? basedir + path.sep : basedir;
  }

  /**
   * Initialise watch files and directories.
   *
   * It must be initialised in main loader function, at finally.
   */
  initWatchFiles() {
    const pluginOption = this.#pluginOption;
    const watchFiles = {
      // watch files only in the directories;
      // defaults is first-level subdirectory of a template, relative to root context
      paths: [],

      // watch only files matched to RegExps,
      // if empty then watch all files, except ignored
      // note: avoids modification of original array
      includes: [...pluginOption.getEntryTest()],

      // ignore paths and files matched to RegExps
      excludes: [
        /[\\/](node_modules|dist|test)$/, // dirs
        /[\\/]\..+$/, // hidden dirs and files: .git, .idea, .gitignore, etc.
        /package(?:-lock)*\.json$/,
        /webpack\.(.+)\.js$/,
        /\.(je?pg|png|ico|gif|webp|svg|woff2?|ttf|otf|eot)$/,
      ],
    };

    const notFoundDirs = [];

    this.#watchFiles = watchFiles;

    const fs = this.fileSystem;
    let { paths, files, ignore, includes, excludes } = pluginOption.getWatchFiles();
    const watchDirs = new Set([rootSourceDir(this.#rootContext, this.#resourcePath)]);
    const rootContext = this.#rootContext;

    if (files) {
      includes = files;
      watchFilesOptionFilesDeprecation();
    }
    if (ignore) {
      excludes = ignore;
      watchIgnoreOptionIgnoreDeprecation();
    }

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
        notFoundDirs.push(watchDir);
      } else {
        watchDirs.add(watchDir);
      }
    }

    // parent watch directories, all paths with subdirectories are ignored
    watchFiles.paths = filterParentPaths(Array.from(watchDirs));

    if (includes) {
      const entries = Array.isArray(includes) ? includes : [includes];
      for (let item of entries) {
        if (item.constructor.name !== 'RegExp') {
          item = new RegExp(item);
        }
        watchFiles.includes.push(item);
      }
    }

    if (excludes) {
      const entries = Array.isArray(excludes) ? excludes : [excludes];
      for (let item of entries) {
        if (item.constructor.name !== 'RegExp') {
          item = new RegExp(item);
        }
        watchFiles.excludes.push(item);
      }
    }

    if (notFoundDirs.length > 0) {
      watchPathsWarning(notFoundDirs, paths);
    }
  }

  /**
   * @param {Object|string|null} dataValue If string, the relative or absolute filename.
   * @return {Promise<Object>}
   */
  #loadData(dataValue) {
    return new Promise((resolve, reject) => {
      if (typeof dataValue !== 'string') {
        resolve(dataValue || {});
        return;
      }

      const fs = this.fileSystem;
      let dataFile = PluginService.getDataFiles(this.pluginCompiler, dataValue);

      const load = () => {
        loadModuleAsync(dataFile)
          .then((data) => {
            resolve(data || {});
          })
          .catch((error) => {
            reject(getDataFileException(error, dataFile));
          });
      };

      if (dataFile) {
        load();
        return;
      }

      dataFile = this.resolveFile(dataValue);

      fileExistsAsync.call(fs, dataFile).then((exists) => {
        if (!exists) {
          reject(getDataFileNotFoundException(dataFile));
        }

        PluginService.setDataFiles(this.pluginCompiler, dataValue, dataFile);
        load();
      });
    });
  }

  /**
   * Resolve relative file path.
   *
   * @param {string} file
   * @return {string}
   */
  resolveFile(file) {
    const context = this.pluginCompiler.options.context;
    return path.isAbsolute(file) ? file : path.join(context, file);
  }

  /**
   * Returns original loader options.
   *
   * @return {{}}
   */
  get() {
    return this.#options;
  }

  /**
   * @return {boolean}
   */
  isWatchMode() {
    return this.#watch;
  }

  /**
   * Whether the preprocessor is not disabled.
   * Defaults the preprocessor is Eta, enabled.
   *
   * @return {boolean}
   */
  isPreprocessorEnabled() {
    return this.#options.preprocessor !== false;
  }

  /**
   * Whether the file matches a route file.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  isRoute(resource) {
    return this.#pluginOption.isRoute(resource);
  }

  /**
   * Whether the router is force disabled.
   * @return {boolean}
   */
  isRouterEnabled() {
    return this.#pluginOption.isRouterEnabled();
  }

  /**
   * Whether the file matches a template entry file.
   *
   * @param {string} resource The resource file, including a query.
   * @return {boolean}
   */
  isEntry(resource) {
    return this.#pluginOption.isEntry(resource);
  }

  /**
   * Whether the preprocessor function is already created.
   *
   * @return {boolean}
   */
  hasPreprocessor() {
    return this.#preprocessorModule._module != null;
  }

  /**
   * Returns a preprocessor method to render/compile a template.
   *
   * @return {null|(function(string, loaderContext: BundlerPluginLoaderContext): Promise|null)}
   */
  getPreprocessor() {
    if (!this.isPreprocessorEnabled()) return null;

    const { _module: preprocessorModule } = this.#preprocessorModule;
    const { preprocessorMode } = this.#options;

    // render/compile
    const module = preprocessorModule[preprocessorMode];

    return typeof module === 'function' ? module : null;
  }

  /**
   * Save preprocessor module or function.
   *
   * @param {Object} preprocessor
   */
  setPreprocessorModule(preprocessor) {
    // save preprocessor into options, because it will be cached,
    // that reduce amount of the preprocessor creation by every loader calling
    this.#preprocessorModule._module = preprocessor;
  }

  /**
   * @return {Object}
   */
  getPreprocessorModule() {
    return this.#preprocessorModule._module;
  }

  /**
   * Returns the root directory for the paths in template starting with leading `/`.
   * @return {string|false}
   */
  getBasedir() {
    return this.#options.basedir;
  }

  /**
   * Returns the context directory for the paths in template starting w/o leading `/`.
   * @return {string|false}
   */
  getContextDir() {
    return this.#options.contextDir;
  }

  /**
   * Returns the list of tags and attributes where source files should be resolved.
   *
   * @return {Array<OptionSources>|false}
   */
  getSources = () => {
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
      let { tag, attributes } = item;

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

  getCustomWatchFiles() {
    return Array.from(PluginService.getValuesOfDataFiles(this.pluginCompiler));
  }

  getWatchFiles() {
    return this.#watchFiles;
  }

  getWatchPaths() {
    return this.#watchFiles.paths;
  }

  getWebpackResolve() {
    return this.#webpackOptions.resolve || {};
  }
}

module.exports = Option;
