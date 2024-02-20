const path = require('path');
const { loadModule } = require('../../../Common/FileUtils');
const VMScript = require('../../../Common/VMScript');
const ResolvePlugin = require('./ResolvePlugin');
const Resolver = require('../../Resolver');
const Filter = require('./Filter');

const scriptExtensionRegexp = /\.js[a-z\d]*$/i;
const isRequireableScript = (file) => !path.extname(file) || scriptExtensionRegexp.test(file);

/**
 * Encode reserved HTML chars.
 *
 * @param {string} str
 * @return {string}
 */
const encodeReservedChars = (str) => {
  if (str.indexOf('?') < 0) return str;

  const match = /[&'"]/g;
  const replacements = { '&': '\\u0026', "'": '\\u0060', '"': '\\u0060' };
  const replacer = (value) => replacements[value];

  return str.replace(match, replacer);
};

/**
 * Resolve resource file after compilation of source code.
 * At this stage the filename is interpolated in VM.
 *
 * @param {string} file The required file.
 * @param {string} issuer The issuer of required file.
 * @return {string}
 */
const loaderRequire = (file, issuer) => {
  let resolvedFile = Resolver.resolve(file, issuer);

  if (isRequireableScript(resolvedFile)) return require(resolvedFile);

  resolvedFile = encodeReservedChars(resolvedFile);

  return `require('${resolvedFile}')`;
};

const loaderRequireScript = (file, issuer) => {
  let resolvedFile = Resolver.resolve(file, issuer, Resolver.types.script);

  resolvedFile = encodeReservedChars(resolvedFile);

  return `require('${resolvedFile}')`;
};

const loaderRequireStyle = (file, issuer) => {
  let resolvedFile = Resolver.resolve(file, issuer, Resolver.types.style);

  resolvedFile = encodeReservedChars(resolvedFile);

  return `require('${resolvedFile}')`;
};

class PugCompiler {
  /**
   *
   * @param {BundlerPluginLoaderContext} loaderContext The loader context of Webpack.
   * @param {{}} loaderOptions
   */
  constructor(loaderContext, loaderOptions) {
    const { rootContext: context } = loaderContext;
    let basedir = loaderOptions.basedir || context;

    this.pug = loadModule('pug');

    // load built-in filters defined in the loaderOptions.embedFilters into the loaderOptions.filter
    Filter.loadFilters(loaderOptions);

    this.pugOptions = {
      // the root directory of all absolute inclusions, defaults is `/`.
      basedir,

      doctype: loaderOptions.doctype || 'html',
      self: loaderOptions.self || false,
      globals: ['require', ...(loaderOptions.globals || [])],

      // the name of template function, defaults `template`
      name: loaderOptions.name || 'template',

      // filters of rendered content, e.g. markdown-it
      filters: loaderOptions.filters,
      filterOptions: loaderOptions.filterOptions,
      filterAliases: loaderOptions.filterAliases,

      // add the plugin to resolve include, extends, require
      plugins: [ResolvePlugin, ...(loaderOptions.plugins || [])],

      // include inline runtime functions must be true
      inlineRuntimeFunctions: true,

      // for the pure function code w/o exports the module, must be false
      module: false,

      // include the function source in the compiled template, defaults is false
      compileDebug: loaderOptions.compileDebug === true,

      // output compiled function to stdout, must be false
      debug: loaderOptions.debug === true,

      // the pretty option is deprecated and must be false, see https://pugjs.org/api/reference.html#options
      // use the `pretty` option of the pug-plugin to format generated HTML.
      pretty: false,
    };
  }

  _compile(source, file) {
    // note: for each new compilation must be defined the `filename` with current template filename
    // used to resolve import/extends and to improve errors
    this.pugOptions.filename = file;

    return this.pug.compileClientWithDependenciesTracked(source, this.pugOptions).body;
  }

  compile(source, { file }) {
    ResolvePlugin.mode = 'compile';

    const exportFunctionName = 'templateFn';
    const templateFunctionSource = this._compile(source, file);

    return templateFunctionSource + `;var ${exportFunctionName}=${this.pugOptions.name};`;
  }

  /**
   * @param {string} source The template source.
   * @param {string} file The template file.
   * @param {{}} data The template data.
   * @param {boolean} esModule
   * @return {string}
   */
  render(source, { file, data, esModule }) {
    ResolvePlugin.mode = 'render';

    const templateFunctionSource = this._compile(source, file);
    const name = this.pugOptions.name;

    const vmScript = new VMScript(
      {
        require,
        __LOADER_REQUIRE__: loaderRequire,
        __LOADER_REQUIRE_SCRIPT__: loaderRequireScript,
        __LOADER_REQUIRE_STYLE__: loaderRequireStyle,
      },
      name
    );

    return vmScript.exec(templateFunctionSource, { filename: file, data });
  }
}

module.exports = PugCompiler;
