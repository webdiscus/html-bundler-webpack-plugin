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
const pitchLoader = function (request) {
  const loaderContext = this;
  const { context, resource, resourcePath, entryName, entryId, entryData, _module: module } = loaderContext;
  const options = loaderContext.getOptions() || {};
  const callback = loaderContext.async();

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

      callback(null, '// extracted by HTMLBundler CSSLoader\nexport {};');
    }
  );
};

module.exports = loader;
module.exports.pitch = pitchLoader;
