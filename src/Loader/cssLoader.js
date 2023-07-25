/**
 * The CSS loader is needed only for styles imported in JavaScript.
 *
 * Note: styles specified directly in HTML template are extracted without any loader.
 */

const Collection = require('../Plugin/Collection');
const { baseUri, urlPathPrefix } = require('./Utils');

/**
 * TODO: test experiments.css
 *
 * @this {import("webpack").LoaderContext<LoaderOptions>}
 * @param {string} content
 */
const loader = function (content) {
  if (this._compiler.options?.experiments?.css && this._module?.type === 'css') {
    return content;
  }
};

/**
 * @this {import("webpack").LoaderContext<LoaderOptions>}
 * @param {string} request
 */
const pitchLoader2 = function (request) {
  const loaderContext = this;
  const { context, resource, resourcePath, entryName, entryId, entryData, _module: module } = loaderContext;
  const options = loaderContext.getOptions() || {};
  const callback = loaderContext.async();

  // create a unique request different from the original to avoid cyclic loading of the same style file
  request += (resource.includes('?') ? '&' : '?') + 'HTMLBundlerCSSLoader';

  loaderContext.importModule(
    `${resourcePath}.webpack[javascript/auto]!=!!!${request}`,
    {
      layer: options.layer,
      publicPath: urlPathPrefix,
      baseUri,
    },
    /**
     * @param {Error | null | undefined} error
     * @param {object} exports
     */
    (error, exports) => {
      if (error) {
        // TODO: display plugin error
        callback(error);
        return;
      }

      // defaults, the css-loader option `esModule` is `true`
      const esModule = exports.default != null;

      module._cssSource = esModule ? exports.default : exports;
      Collection.setImportStyleEsModule(esModule);

      callback(null, '/* extracted by HTMLBundler CSSLoader */ export {};');
    }
  );
};

const pitchLoader = async function (remaining) {
  const { resource, resourcePath, _module: module } = this;
  const options = this.getOptions() || {};

  remaining += resource.includes('?') ? '&' : '?';

  // create a unique request different from the original to avoid cyclic loading of the same style file
  const request = `${resourcePath}.webpack[javascript/auto]!=!!!${remaining}HTMLBundlerCSSLoader`;
  const result = await this.importModule(request, {
    layer: options.layer,
    publicPath: urlPathPrefix,
    baseUri,
  });

  // defaults, the css-loader option `esModule` is `true`
  const esModule = result.default != null;

  module._cssSource = esModule ? result.default : result;
  Collection.setImportStyleEsModule(esModule);

  return '/* extracted by HTMLBundler CSSLoader */ export {};';
};

module.exports = loader;
module.exports.pitch = pitchLoader;
