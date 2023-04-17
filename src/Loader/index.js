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
  const loaderContext = this;
  const loaderCallback = loaderContext.async();
  const { rootContext, resource, resourcePath } = loaderContext;
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

    const preprocessor = Options.getPreprocessor();
    let result;

    if (preprocessor != null) {
      errorStage = 'preprocessor';
      result = preprocessor(content, loaderContext);
    }
    resolve(result != null ? result : content);
  })
    .then((value) => {
      errorStage = 'compile';
      return Template.compile(value, resource);
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
