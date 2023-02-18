const path = require('path');
const Eta = require('eta');
const HtmlBundler = require('./HtmlBundler');
const PluginService = require('../Plugin/PluginService');
const Dependency = require('./Dependency');
const Resolver = require('./Resolver');
const Loader = require('./Loader');
const { getSourcesOption } = require('./Utils');
const { preprocessorErrorToString, compileErrorToString, exportErrorToString } = require('./Messages/Exeptions');

/**
 * @param {string} content The HTML template.
 * @param {function(error: Error|null, result: string?)?} callback The asynchronous callback function.
 * @return {string|undefined}
 */
const loader = function (content, callback) {
  const loaderContext = this;
  const loaderOptions = loaderContext.getOptions() || {};
  const webpackOptions = loaderContext._compiler.options || {};
  const { rootContext: context, resource, resourcePath, resourceQuery } = loaderContext;
  const sourcesOption = getSourcesOption(loaderOptions.sources);

  // note: the default preprocessor use the Eta templating engine
  let preprocessor = null;
  if (typeof loaderOptions.preprocessor === 'function') {
    preprocessor = loaderOptions.preprocessor;
  } else if (loaderOptions.preprocessor !== false) {
    // note: set the `useWith: true` option to use data in template without `it.` scope
    preprocessor = (content, { data }) => Eta.render(content, data, { async: true, useWith: true });
  }

  let basedir = loaderOptions.basedir || context;
  let customData = {};

  if (basedir.slice(-1) !== '/') basedir += '/';
  if (loaderContext.cacheable != null) loaderContext.cacheable(true);

  // prevent double initialisation with same options, occurs when many entry files used in one webpack config
  if (!PluginService.isCached(context)) {
    Resolver.init({
      rootContext: context,
      basedir,
      options: webpackOptions.resolve || {},
    });
  }

  Loader.init({
    resourcePath,
    resourceQuery,
    options: loaderOptions,
    customData,
  });

  Dependency.init({
    loaderContext,
    watchFiles: loaderOptions.watchFiles,
  });

  // note: the preprocessor can return a promise
  new Promise((resolve, reject) => {
    try {
      let result;
      if (preprocessor != null) {
        result = preprocessor(content, loaderContext);
      }
      resolve(result != null ? result : content);
    } catch (error) {
      const message = preprocessorErrorToString(error, path.relative(context, resourcePath));
      reject(message);
    }
  })
    .then((value) => {
      try {
        return loaderOptions.sources === false ? value : HtmlBundler.compile(value, resource, sourcesOption);
      } catch (error) {
        const message = compileErrorToString(error, path.relative(context, resourcePath));
        Dependency.watch();

        return Promise.reject(message);
      }
    })
    .then((value) => {
      try {
        return Loader.export(value);
      } catch (error) {
        const message = exportErrorToString(error, path.relative(context, resourcePath));
        return Promise.reject(message);
      }
    })
    .then((value) => {
      Dependency.watch();
      callback(null, value);
    })
    .catch((error) => {
      const browserError = Loader.exportError(error, resource);
      callback(error, browserError);
    });
};

module.exports = function (content, map, meta) {
  const loaderContext = this;
  const callback = loaderContext.async();

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
