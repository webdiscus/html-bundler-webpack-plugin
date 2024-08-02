const path = require('path');
const LoaderFactory = require('./LoaderFactory');
const PluginService = require('../Plugin/PluginService');

const Preprocessor = require('./Preprocessor');
const Template = require('./Template');
const Render = require('./Modes/Render');

const {
  notInitializedPluginError,
  initError,
  beforePreprocessorError,
  preprocessorError,
  resolveError,
  exportError,
} = require('./Messages/Exeptions');

/**
 * @param {string} content
 * @param {any} map
 * @param {any} meta
 */
const loader = function (content, map, meta) {
  const pluginCompiler = this._compilation.compiler;

  /** @type {BundlerPluginLoaderContext} */
  const loaderContext = this;

  const loaderCallback = loaderContext.async();
  const { rootContext, resource, resourcePath, entryId } = loaderContext;
  let errorStage = '';

  const callback = (error, result = null) => {
    if (error) {
      // in build mode, abort the compilation process and display an error in the output
      if (result == null || !PluginService.isWatchMode(pluginCompiler)) return loaderCallback(error);

      // in watch mode, display an error in the output without abort the compilation process
      loaderContext.emitError(error);
    }
    loaderCallback(null, result, map, meta);
  };

  if (!PluginService.isUsed(pluginCompiler)) {
    callback(notInitializedPluginError());
    return;
  }

  // create cached instance via PluginService by pluginCompiler to avoid needless double initialisation of instances
  LoaderFactory.init(pluginCompiler);

  const dependency = LoaderFactory.createDependency(pluginCompiler);
  const resolver = LoaderFactory.createResolver(pluginCompiler, loaderContext);
  const loaderOption = LoaderFactory.createOption(pluginCompiler, loaderContext);
  const loader = LoaderFactory.createLoader(pluginCompiler);
  const hooks = PluginService.getHooks(pluginCompiler);

  // bind the loaderOption before initialisations
  PluginService.setLoaderOption(pluginCompiler, loaderOption);

  new Promise((resolve) => {
    // the options must be initialized before others
    errorStage = 'init';

    if (loaderOption.isWatchMode()) loaderOption.initWatchFiles();

    // INIT dependency must be initialized before init Option, because in Option is initialised preprocessor, that require dependency
    dependency.init({ loaderContext, loaderOption });

    // INIT preprocessor
    Preprocessor.init(loaderContext, loaderOption);

    // INIT loader
    loader.init(loaderContext, {
      pluginCompiler,
      loaderOption,
      resolver,
      collection: PluginService.getPluginContext(pluginCompiler).collection,
    });

    // INIT resolver
    // prevent double initialization with same options, it occurs when many entry files used in one webpack config
    // TODO: check whether it is here need, because already used LoaderFactory with caching of created/initialised instances
    if (!PluginService.isCached(pluginCompiler, rootContext)) {
      resolver.init(loaderOption);
    }

    // init watching after all initialisations
    //if (loaderOption.isWatchMode()) loaderOption.initWatchFiles();

    resolve();
  })
    .then(() => {
      errorStage = 'beforePreprocessor';
      return hooks.beforePreprocessor.promise(content, loaderContext);
    })
    .then((value) => {
      const beforePreprocessor = loaderOption.get().beforePreprocessor;
      if (beforePreprocessor != null) {
        errorStage = 'beforePreprocessor';
        return beforePreprocessor(value, loaderContext) || value;
      }
      return value;
    })
    .then((value) => {
      const loaderOptions = loaderOption.get();
      errorStage = 'preprocessor';
      // TODO: add to types.d.ts loaderOptions as 3rd param
      return hooks.preprocessor.promise(value, loaderContext, loaderOptions);
    })
    .then((value) => {
      // 3
      const preprocessor = loaderOption.getPreprocessor();
      if (preprocessor) {
        const loaderOptions = loaderOption.get();
        errorStage = 'preprocessor';

        // TODO: add to types.d.ts loaderOptions as 3rd param
        return preprocessor(value, loaderContext, loaderOptions) || value;
      }
      return value;
    })
    // TODO: implement and docs
    // .then((value) => {
    //   errorStage = 'afterPreprocessor';
    //   return hooks.afterPreprocessor.promise(value, loaderContext);
    // })
    // .then((value) => {
    //   const afterPreprocessor = loaderOption.get().afterPreprocessor;
    //   if (afterPreprocessor != null) {
    //     errorStage = 'afterPreprocessor';
    //     return afterPreprocessor(value, loaderContext) || value;
    //   }
    //   return value;
    // })
    .then((content) => {
      errorStage = 'resolve';
      return Template.resolve({ content, issuer: resource, entryId, hooks, loader, loaderOption });
    })
    .then((value) => {
      errorStage = 'export';
      return loader.export(value, loaderContext);
    })
    .then((value) => {
      errorStage = 'watch';
      dependency.watch();

      callback(null, value);
    })
    .catch((error) => {
      const issuer = path.relative(rootContext, resourcePath);

      switch (errorStage) {
        case 'init':
          error = initError(error, issuer);
          break;
        case 'beforePreprocessor':
          error = beforePreprocessorError(error, issuer);
          break;
        case 'preprocessor':
          error = preprocessorError(error, issuer);
          break;
        case 'resolve':
          error = resolveError(error, issuer);
          break;
        case 'export':
          error = exportError(error, issuer);
          break;
        default:
          // TODO: test this case
          // unrecoverable configuration error, requires to restart Webpack
          const render = new Render({});
          const browserErrorMessage = render.exportError(error, resource);
          callback(error, browserErrorMessage);
          return;
      }

      const browserErrorMessage = loader?.exportError(error, resource);

      // initialize dependency when an exception occurs before regular dependency initialisation
      dependency.init({ loaderContext, loaderOption });
      dependency.watch();
      callback(error, browserErrorMessage);
    });
};

module.exports = loader;
