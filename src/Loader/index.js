const { merge } = require('webpack-merge');
const HtmlBundler = require('./HtmlBundler');
const PluginService = require('../Plugin/PluginService');
const ScriptCollection = require('../Plugin/ScriptCollection');
const Dependency = require('./Dependency');
const Resolver = require('./Resolver');
const Loader = require('./Loader');

const {
  getCompileErrorMessage,
  getCompileErrorHtml,
  getExecuteTemplateFunctionErrorMessage,
} = require('./Messages/Exeptions');

/**
 * @param {string} content The HTML template.
 * @param {function(error: Error|null, result: string?)?} callback The asynchronous callback function.
 * @return {string|undefined}
 */
const compile = function (content, callback) {
  const loaderContext = this;
  const loaderOptions = loaderContext.getOptions() || {};
  const webpackOptions = loaderContext._compiler.options || {};
  const { rootContext: context, resource, resourcePath: filename, resourceQuery } = loaderContext;
  const preprocessor = typeof loaderOptions.preprocessor === 'function' ? loaderOptions.preprocessor : null;
  let basedir = loaderOptions.basedir || context;
  let customData = {};
  let compileResult;
  let result;

  // default tags and attributes for resolving resources
  const sources = [
    { tag: 'link', attributes: ['href', 'imagesrcset'] }, // `imagesrcset` is for rel="preload" and as="image" only
    { tag: 'script', attributes: ['src'] },
    { tag: 'img', attributes: ['src', 'srcset'] },
    { tag: 'input', attributes: ['src'] }, // type="image"
    { tag: 'source', attributes: ['src', 'srcset'] },
    { tag: 'audio', attributes: ['src'] },
    { tag: 'track', attributes: ['src'] },
    { tag: 'video', attributes: ['src', 'poster'] },
    { tag: 'object', attributes: ['data'] },
  ];

  // merge defaults and custom sources
  if (Array.isArray(loaderOptions.sources)) {
    for (const item of loaderOptions.sources) {
      const source = sources.find(({ tag }) => tag === item.tag);
      if (source) {
        source.attributes = [...source.attributes, ...(item.attributes || [])];
        if (typeof item.filter === 'function') {
          source.filter = item.filter;
        }
      } else {
        sources.push(item);
      }
    }
  }

  if (basedir.slice(-1) !== '/') basedir += '/';
  if (loaderContext.cacheable != null) loaderContext.cacheable(true);

  // prevent double initialisation with same options, occurs when many entry files used in one webpack config
  if (!PluginService.isCached(context)) {
    Resolver.init({
      basedir,
      options: webpackOptions.resolve || {},
    });
  }

  Loader.init({
    filename,
    resourceQuery,
    options: loaderOptions,
    customData,
  });

  ScriptCollection.init({
    // filename with url query
    issuer: resource,
  });

  Dependency.init({
    loaderContext,
    watchFiles: loaderOptions.watchFiles,
  });

  try {
    if (preprocessor !== null) {
      content = preprocessor(content, loaderContext);
    }
  } catch (error) {
    const preprocessorError = `[html-bundler-loader] Error in preprocessor!`;
    const compileError = new Error(error);
    callback(compileError, preprocessorError);

    return;
  }

  try {
    compileResult = loaderOptions.sources === false ? content : HtmlBundler.compile(content, filename, sources);

    // Note: don't use compileResult.dependencies because it is not available by compile error.
    // The loader tracks all dependencies during compilation and stores them in `Dependency` instance.
  } catch (error) {
    if (error.filename) {
      Dependency.add(error.filename);
    }
    Dependency.watch();

    // render error message for output in browser
    const exportError = Loader.exportError(error, getCompileErrorHtml);
    const compileError = new Error(getCompileErrorMessage(error));
    callback(compileError, exportError);

    return;
  }

  try {
    result = Loader.export(compileResult);
  } catch (error) {
    // render error message for output in browser
    const exportError = Loader.exportError(error, getExecuteTemplateFunctionErrorMessage);
    const compileError = new Error(error);
    callback(compileError, exportError);

    return;
  }

  Dependency.watch();
  callback(null, result);
};

module.exports = function (content, map, meta) {
  const loaderContext = this;
  const callback = loaderContext.async();

  // note: the 'entryData' is the custom property defined in plugin
  // set the origin 'data' property of loader context,
  // see https://webpack.js.org/api/loaders/#thisdata
  if (loaderContext.entryData != null) {
    const loader = loaderContext.loaders[loaderContext.loaderIndex];
    loader.data = loaderContext.entryData;
    delete loaderContext.entryData;
  }

  compile.call(loaderContext, content, (error, result) => {
    if (error) {
      // if HMR is disabled interrupt the compilation process
      if (loaderContext.hot !== true) return callback(error);

      // if HMR is enabled emit an error that will be displayed in the output
      // it will NOT interrupt the compilation process
      loaderContext.emitError(error);
    }

    callback(null, result, map, meta);
  });
};
