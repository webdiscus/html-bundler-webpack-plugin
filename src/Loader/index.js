const path = require('path');
const PluginService = require('../Plugin/PluginService');
const Template = require('./Template');
const Loader = require('./Loader');
const Dependency = require('./Dependency');
const Options = require('./Options');
const {
  preprocessorErrorToString,
  compileErrorToString,
  exportErrorToString,
  unknownErrorToString,
} = require('./Messages/Exeptions');

/**
 * @param {string} content
 * @param {any} map
 * @param {any} meta
 */
const loader = function (content, map, meta) {
  const loaderContext = this;
  const loaderCallback = loaderContext.async();
  const { loaderIndex, rootContext, resource, resourcePath } = loaderContext;
  let stage = '';

  const callback = (error, result) => {
    if (error) {
      // in build mode, abort the compilation process and display an error in the output
      if (!PluginService.isWatchMode()) return loaderCallback(error);

      // in watch mode, display an error in the output without abort the compilation process
      loaderContext.emitError(error);
    }

    loaderCallback(null, result, map, meta);
  };

  if (loaderContext.cacheable != null) loaderContext.cacheable(true);

  // the options must be initialized before others
  Options.init(loaderContext);
  Loader.init(loaderContext);
  Dependency.init(loaderContext);

  new Promise((resolve) => {
    const preprocessor = Options.getPreprocessor();
    let result;
    stage = 'preprocessor';

    if (preprocessor != null) {
      // set data specified in 'entry' option of the plugin
      if (loaderContext.entryData != null) {
        const loaderObject = loaderContext.loaders[loaderIndex];
        loaderObject.data = loaderContext.entryData;
        delete loaderContext.entryData;
      }
      result = preprocessor(content, loaderContext);
    }
    resolve(result != null ? result : content);
  })
    .then((value) => {
      stage = 'compile';
      return Template.compile(value, resource);
    })
    .then((value) => {
      stage = 'export';
      return Loader.export(value);
    })
    .then((value) => {
      Dependency.watch();
      callback(null, value);
    })
    .catch((error) => {
      const issuer = path.relative(rootContext, resourcePath);
      let message;

      switch (stage) {
        case 'preprocessor':
          message = preprocessorErrorToString(error, issuer);
          break;
        case 'compile':
          message = compileErrorToString(error, issuer);
          Dependency.watch();
          break;
        case 'export':
          message = exportErrorToString(error, issuer);
          break;
        default:
          message = unknownErrorToString(error, issuer);
      }

      const browserError = Loader.exportError(message, resource);

      Dependency.watch();
      callback(message, browserError);
    });
};

module.exports = loader;
