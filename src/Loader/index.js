const path = require('path');
const PluginService = require('../Plugin/PluginService');
const Template = require('./Template');
const Loader = require('./Loader');
const RenderMode = require('./Modes/RenderMode');
const Dependency = require('./Dependency');
const Options = require('./Options');
const { notInitializedPluginError, preprocessorError, compileError, exportError } = require('./Messages/Exeptions');

/**
 * @param {string} content
 * @param {any} map
 * @param {any} meta
 */
const loader = function (content, map, meta) {
  const loaderContext = this;
  const loaderCallback = loaderContext.async();
  const { loaderIndex, rootContext, resource, resourcePath } = loaderContext;
  let errorStage = 'init';

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
    Options.init(loaderContext);
    Loader.init(loaderContext);

    const preprocessor = Options.getPreprocessor();
    let result;

    if (preprocessor != null) {
      // set data specified in 'entry' option of the plugin
      if (loaderContext.entryData != null) {
        const loaderObject = loaderContext.loaders[loaderIndex];
        loaderObject.data = loaderContext.entryData;
        delete loaderContext.entryData;
      }
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
          // unrecoverable configuration error, Webpack restart required
          const mode = new RenderMode({});
          const browserErrorMessage = mode.exportError(error, resource);
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
