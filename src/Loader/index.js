const path = require('path');
const PluginService = require('../Plugin/PluginService');
const Template = require('./Template');
const Loader = require('./Loader');
const Dependency = require('./Dependency');
const Options = require('./Options');
const { preprocessorErrorToString, compileErrorToString, exportErrorToString } = require('./Messages/Exeptions');

const RenderMethod = require('./methods/RenderMethod');

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

  const callback = (error, result) => {
    if (error) {
      // in build mode, abort the compilation process and display an error in the output
      if (!PluginService.isWatchMode()) return loaderCallback(error);

      // in watch mode, display an error in the output without abort the compilation process
      loaderContext.emitError(error);
    }
    loaderCallback(null, result, map, meta);
  };

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
      return Loader.export(value);
    })
    .then((value) => {
      errorStage = 'watch';
      Dependency.init(loaderContext);
      Dependency.watch();
      callback(null, value);
    })
    .catch((error) => {
      const issuer = path.relative(rootContext, resourcePath);
      let message;

      switch (errorStage) {
        case 'preprocessor':
          message = preprocessorErrorToString(error, issuer);
          break;
        case 'compile':
          message = compileErrorToString(error, issuer);
          break;
        case 'export':
          message = exportErrorToString(error, issuer);
          break;
        default:
          // unrecoverable configuration error, Webpack restart required
          const method = new RenderMethod({});
          const browserError = method.exportError(error, resource);
          callback(error, browserError);
          return;
      }

      const browserError = Loader.exportError(message, resource);

      Dependency.init(loaderContext);
      Dependency.watch();
      callback(message, browserError);
    });
};

module.exports = loader;
