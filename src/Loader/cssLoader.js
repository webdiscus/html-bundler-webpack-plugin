/**
 * The CSS loader is needed only for styles imported in JavaScript.
 *
 * Note: styles specified directly in HTML template are extracted without any loader.
 */

const Collection = require('../Plugin/Collection');
const { baseUri, urlPathPrefix, cssLoaderName } = require('./Utils');

/**
 * @this {import("webpack").LoaderContext<LoaderOptions>}
 * @param {string} content
 */
const loader = function (content) {
  /* istanbul ignore next */
  if (this._compiler.options?.experiments?.css && this._module?.type === 'css') {
    return content;
  }
};

/**
 * @this {import("webpack").LoaderContext<LoaderOptions>}
 * @param {string} remaining
 */
const pitchLoader = async function (remaining) {
  // TODO: find the module from this._compilation, because this._module is deprecated
  const { resource, resourcePath, _module: module } = this;
  const options = this.getOptions() || {};
  const isLazy = module.resourceResolveData?.query.includes('lazy');

  remaining += resource.includes('?') ? '&' : '?';

  // create a unique request different from the original to avoid cyclic loading of the same style file
  const request = `${resourcePath}.webpack[javascript/auto]!=!!!${remaining}${cssLoaderName}`;
  const result = await this.importModule(request, {
    layer: options.layer,
    publicPath: urlPathPrefix,
    baseUri,
  });

  // defaults, the css-loader option `esModule` is `true`
  const esModule = result.default != null;

  module._cssSource = esModule ? result.default : result;
  Collection.setImportStyleEsModule(esModule);

  // support for lazy load CSS in JavaScript, see js-import-css-lazy
  return '/* extracted by HTMLBundler CSSLoader */' + (isLazy ? module._cssSource : '');
};

module.exports = loader;
module.exports.pitch = pitchLoader;
