const path = require('path');
const PluginService = require('../Plugin/PluginService');
const { parseQuery } = require('../Common/Helpers');
const { rootSourceDir, filterParentPaths } = require('../Common/FileUtils');
const { findRootIssuer } = require('../Common/CompilationHelpers');
const { dataFileNotFoundException, dataFileException } = require('./Messages/Exeptions');
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

      // whether it should be used ESM export for the rendered/compiled result
      options.esModule = options?.esModule === true;

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

    // if the data option is a string, it must be an absolute or relative filename of an existing file that exports the data
    const loaderData = this.#loadData(options.data);
    const entryData = this.#loadData(loaderContext.entryData);
    const contextData = loaderContext.data || {};

    // merge plugin and loader data, the plugin data property overrides the same loader data property
    loaderObject.data = { ...contextData, ...loaderData, ...entryData, ...this.#queryData };

    this.#initPreprocessor(loaderContext);

    // beforePreprocessor
    if (typeof options.beforePreprocessor !== 'function') {
      options.beforePreprocessor = null;
    }

    // clean loaderContext of artifacts
    if (loaderContext.entryData != null) delete loaderContext.entryData;

    // defaults, cacheable is true, the loader option is not documented in readme, use it only for debugging
    if (loaderContext.cacheable != null) loaderContext.cacheable(options?.cacheable !== false);
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
      includes: pluginOption.getEntryTest(),

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
   * @return {Object}
   */
  #loadData(dataValue) {
    if (typeof dataValue !== 'string') return dataValue || {};

    let dataFile = PluginService.getDataFiles(this.pluginCompiler, dataValue);

    if (!dataFile) {
      const fs = this.fileSystem;
      dataFile = path.isAbsolute(dataValue) ? dataValue : path.join(process.cwd(), dataValue);

      if (!fs.existsSync(dataFile)) {
        dataFileNotFoundException(dataFile);
      }
      PluginService.setDataFiles(this.pluginCompiler, dataValue, dataFile);
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
   * Returns the root directory for the paths in template starting with `/`.
   * @return {string|false}
   */
  getBasedir() {
    return this.#options.basedir;
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
