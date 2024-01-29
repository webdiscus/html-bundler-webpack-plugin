const path = require('path');
const PluginService = require('../Plugin/PluginService');
const Template = require('./Template');
const Loader = require('./Loader');
const Render = require('./Modes/Render');
const Dependency = require('./Dependency');
const Option = require('./Option');
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
  /** @type {BundlerPluginLoaderContext} */
  const loaderContext = this;
  const loaderCallback = loaderContext.async();
  const { rootContext, resource, resourcePath, entryId } = loaderContext;
  const hooks = PluginService.getHooks();
  let errorStage = '';

  const callback = (error, result = null) => {
    if (error) {
      // in build mode, abort the compilation process and display an error in the output
      if (result == null || !PluginService.isWatchMode()) return loaderCallback(error);

      // in watch mode, display an error in the output without abort the compilation process
      loaderContext.emitError(error);
    }
    loaderCallback(null, result, map, meta);
  };

  if (!PluginService.isUsed()) {
    callback(notInitializedPluginError());
    return;
  }

  new Promise((resolve) => {
    // the options must be initialized before others
    errorStage = 'init';
    Option.init(loaderContext);
    Loader.init(loaderContext);
    resolve();
  })
    .then(() => {
      errorStage = 'beforePreprocessor';
      return hooks.beforePreprocessor.promise(content, loaderContext);
    })
    .then((value) => {
      const beforePreprocessor = Option.get().beforePreprocessor;
      if (beforePreprocessor != null) {
        errorStage = 'beforePreprocessor';
        return beforePreprocessor(value, loaderContext) || value;
      }
      return value;
    })
    .then((value) => {
      const loaderOptions = Option.get();
      errorStage = 'preprocessor';
      // TODO: add to types.d.ts loaderOptions as 3rd param
      return hooks.preprocessor.promise(value, loaderContext, loaderOptions);
    })
    .then((value) => {
      const preprocessor = Option.getPreprocessor();
      if (preprocessor != null) {
        const loaderOptions = Option.get();
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
    //   const afterPreprocessor = Option.get().afterPreprocessor;
    //   if (afterPreprocessor != null) {
    //     errorStage = 'afterPreprocessor';
    //     return afterPreprocessor(value, loaderContext) || value;
    //   }
    //   return value;
    // })
    .then((value) => {
      errorStage = 'resolve';
      return Template.resolve(value, resource, entryId, hooks);
    })
    .then((value) => {
      errorStage = 'export';
      return Loader.export(value, loaderContext);
    })
    .then((value) => {
      errorStage = 'watch';
      Dependency.init(loaderContext);
      Dependency.watch();
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

      const browserErrorMessage = Loader.exportError(error, resource);

      Dependency.init(loaderContext);
      Dependency.watch();
      callback(error, browserErrorMessage);
    });
};

module.exports = loader;
