const path = require('path');
const PluginService = require('../Plugin/PluginService');
const Template = require('./Template');
const Loader = require('./Loader');
const Resolver = require('./Resolver');
const Dependency = require('./Dependency');
const Options = require('./Options');
const {
  preprocessorErrorToString,
  compileErrorToString,
  exportErrorToString,
  unknownErrorToString,
} = require('./Messages/Exeptions');

/**
 * @param {string} content The HTML template.
 * @param {function(error: Error|null, result: string?)?} callback The asynchronous callback function.
 * @return {string|undefined}
 */
const loader = function (content, callback) {
  const loaderContext = this;
  const { rootContext, resource, resourcePath, resourceQuery } = loaderContext;
  let stage = '';

  Options.init(loaderContext);

  // prevent double initialisation with same options, occurs when many entry files used in one webpack config
  if (!PluginService.isCached(rootContext)) {
    Resolver.init(rootContext);
  }

  Loader.init({ resourcePath, resourceQuery });
  Dependency.init(loaderContext);

  new Promise((resolve) => {
    const preprocessor = Options.getPreprocessor();
    let result;
    stage = 'preprocessor';

    if (preprocessor != null) {
      // the preprocessor can return a string, promise or null
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
      callback(message, browserError);
    });
};

module.exports = function (content, map, meta) {
  const loaderContext = this;
  const callback = loaderContext.async();

  if (loaderContext.cacheable != null) loaderContext.cacheable(true);

  // note: the 'entryData' is the custom property defined in the plugin
  // set the origin 'data' property of loader context,
  // see https://webpack.js.org/api/loaders/#thisdata
  if (loaderContext.entryData != null) {
    const loader = loaderContext.loaders[loaderContext.loaderIndex];
    loader.data = loaderContext.entryData;
    delete loaderContext.entryData;
  }

  loader.call(loaderContext, content, (error, result) => {
    if (error) {
      // if HMR is disabled interrupt the compilation process
      if (loaderContext.hot !== true) return callback(error);

      // if HMR is enabled emit an error that will be displayed in the output
      // it will not interrupt the compilation process
      loaderContext.emitError(error);
    }

    callback(null, result, map, meta);
  });
};
