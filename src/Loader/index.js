const path = require('path');
const PluginService = require('../Plugin/PluginService');
const Template = require('./Template');
const Loader = require('./Loader');
const RenderMode = require('./Modes/RenderMode');
const Dependency = require('./Dependency');
const Options = require('./Options');
const {
  notInitializedPluginError,
  initError,
  beforePreprocessorError,
  preprocessorError,
  compileError,
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
    Options.init(loaderContext);
    Loader.init(loaderContext);
    resolve();
  })
    .then(() => {
      errorStage = 'beforePreprocessor';
      return hooks.beforePreprocessor.promise(content, loaderContext);
    })
    .then((value) => {
      const beforePreprocessor = Options.get().beforePreprocessor;
      if (beforePreprocessor != null) {
        errorStage = 'beforePreprocessor';
        return beforePreprocessor(value, loaderContext) || value;
      }
      return value;
    })
    .then((value) => {
      errorStage = 'preprocessor';
      return hooks.preprocessor.promise(value, loaderContext);
    })
    .then((value) => {
      const preprocessor = Options.getPreprocessor();
      if (preprocessor != null) {
        errorStage = 'preprocessor';
        return preprocessor(value, loaderContext) || value;
      }
      return value;
    })
    .then((value) => {
      errorStage = 'compile';
      return Template.compile(value, resource, entryId);
    })
    .then((value) => {
      errorStage = 'export';
      return Loader.export(value, resource);
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
        case 'compile':
          error = compileError(error, issuer);
          break;
        case 'export':
          error = exportError(error, issuer);
          break;
        default:
          // TODO: test this case
          // unrecoverable configuration error, requires to restart Webpack
          const render = new RenderMode({});
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
