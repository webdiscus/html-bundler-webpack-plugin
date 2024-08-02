const { loadModule } = require('../../../Common/FileUtils');
const VMScript = require('../../../Common/VMScript');
const Filter = require('./Filter');
const { LoaderResolvers, ResolvePlugin } = require('./ResolvePlugin');

class PugCompiler {
  pug = null;
  pugOptions = null;
  resolvePlugin = null;
  vmContext = null;

  /**
   *
   * @param {BundlerPluginLoaderContext} loaderContext The loader context of Webpack.
   * @param {{}} loaderOptions
   */
  constructor(loaderContext, loaderOptions) {
    const { rootContext: context } = loaderContext;
    let basedir = loaderOptions.basedir || context;

    const pluginCompiler = loaderContext._compilation.compiler;

    this.resolvePlugin = ResolvePlugin(pluginCompiler);
    this.vmContext = LoaderResolvers(pluginCompiler);

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
      plugins: [this.resolvePlugin, ...(loaderOptions.plugins || [])],

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

    let tmplFn = this.pug.compileClientWithDependenciesTracked(source, this.pugOptions).body;

    return tmplFn.replaceAll('__DECODE_AMP__', '&');
  }

  compile(source, { file }) {
    this.resolvePlugin.setMode('compile');

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
    this.resolvePlugin.setMode('render');

    const templateFunctionSource = this._compile(source, file);
    const vmScript = new VMScript(this.vmContext, this.pugOptions.name);

    return vmScript.exec(templateFunctionSource, { filename: file, data });
  }
}

module.exports = PugCompiler;
