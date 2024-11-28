/**
 * The CSS loader is needed only for styles imported in JavaScript.
 *
 * Note: styles specified directly in HTML template are extracted without any loader.
 */

const { baseUri, urlPathPrefix, cssLoaderName } = require('./Utils');
const PluginService = require('../Plugin/PluginService');

/**
 * @this {import("webpack").LoaderContext<LoaderOption>}
 * @param {string} content
 */
const loader = function (content) {
  //const loaderContext = this;

  /* istanbul ignore next */
  if (this._compiler.options?.experiments?.css && this._module?.type === 'css') {
    return content;
  }
};

/**
 * @this {import("webpack").LoaderContext<LoaderOption>}
 * @param {string} remaining
 */
const pitchLoader = async function (remaining) {
  const loaderContext = this;
  const pluginCompiler = loaderContext._compilation.compiler;
  const pluginContext = PluginService.getPluginContext(pluginCompiler);
  const collection = pluginContext.collection;
  const isHmr = pluginContext.pluginOption.isCssHot();

  // TODO: find the module from this._compilation, because this._module is deprecated
  const { resource, resourcePath, _module: module } = this;
  const options = this.getOptions() || {};
  const isUrl = module.resourceResolveData?.query.includes('url');
  const exportComment = '/* extracted by HTMLBundler CSSLoader */';

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
  const cssSource = esModule ? result.default : result;
  let styles;

  collection.setImportStyleEsModule(esModule);

  if (esModule) {
    const exports = Object.keys(result).filter((key) => key !== 'default');

    if (exports.length > 0) {
      styles = {};
      for (const className of exports) {
        styles[className] = result[className];
      }
    }
  } else if ('locals' in result) {
    styles = result.locals;
  }

  if (!isHmr) {
    module._cssSource = cssSource;
  }

  // support for lazy load CSS in JavaScript, see the test js-import-css-lazy-url
  if (isUrl) {
    return exportComment + cssSource;
  }

  let hmrCode = '';

  if (isHmr) {
    let css = result.default.toString();
    const search = /\n|`/g;
    const replacements = {
      '\n': '',
      '`': '\\`',
    };

    css = css.replace(search, (str) => replacements[str]);

    hmrCode = `
const css = \`${css}\`;
const isDocument = typeof document !== 'undefined';

function hotUpdateCSS(css) {
  const key = '__bundlerCssHmr';
  
  document[key] = document[key] || { idx: 1, styleIds: new Map() };
  const hmr = document[key];
  const moduleId = module.id;
  let styleId = hmr.styleIds.get(moduleId);
  let styleElm;

  if (styleId) {
    styleElm = document.getElementById(styleId);
  } else {
    styleId = 'hot-update-style-' + hmr.idx++;
    styleElm = document.createElement('style');
    styleElm.setAttribute('id', styleId);
    document.head.appendChild(styleElm);
    hmr.styleIds.set(moduleId, styleId);
  }

  if (styleElm) {
     styleElm.innerText = css;
  }
}

if (isDocument) {
  // required to avoid full reload
  module.hot && module.hot.accept(undefined, function () {});
  hotUpdateCSS(css);
} else {
  console.log('CSS HMR does not work!');
}
`;
  }

  return styles
    ? (esModule ? 'export default' : 'module.exports = ') + JSON.stringify(styles)
    : exportComment + hmrCode;
};

module.exports = loader;
module.exports.pitch = pitchLoader;
