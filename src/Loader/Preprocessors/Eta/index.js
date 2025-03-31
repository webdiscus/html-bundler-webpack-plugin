const { readFileSync } = require('fs');
const path = require('path');
const { stringifyJSON } = require('../../Utils');
const { loadModule } = require('../../../Common/FileUtils');
const MarkdownFilter = require('../../PreprocessorFilters/markdown');

// replace the partial file and data to load nested included template via the Webpack loader
// include("./file.html")                   => require("./file.eta")({...it, ...{}})
// include('./file.html', { name: 'Siri' }) => require('./file.eta')({...it, ...{name: 'Siri'}})
const includeRegexp = /=include\((.+?)(?:\)|,\s*{(.+?)}\))/g;

// node module name
const moduleName = 'eta';

/**
 * Transform the raw template source to a template function or HTML.
 *
 * @param {BundlerPluginLoaderContext} loaderContext
 * @param {{}} options
 * @return {{compile: (function(string, {resourcePath: string, data?: {}}): string), render: {(*, {resourcePath: *, data?: {}}): *, (*, {resourcePath: *, data?: {}}): *}, export: (function(string, {data: {}}): string)}}
 */
const preprocessor = (loaderContext, options) => {
  const Eta = loadModule(moduleName, () => require(moduleName).Eta);
  const { rootContext } = loaderContext;
  let views = options.views;

  // since eta v3 the `async` option is removed, but for compatibility, it is still used in this plugin
  // defaults is false, when is true then must be used `await includeAsync()`
  const async = options?.async === true;

  if (!views) {
    views = rootContext;
  } else if (!path.isAbsolute(views)) {
    views = path.join(rootContext, views);
  }

  const eta = new Eta({
    useWith: true, // allow using variables in template without `it.` namespace
    ...options,
    views, // directory that contains templates
  });

  const markdownFilterOptions = {
    highlight: {
      use: {
        module: 'prismjs',
        options: {
          verbose: true, // display loaded dependencies
        },
      },
    },
  };

  eta.readFile = (file) => {
    const source = readFileSync(file, 'utf-8');

    if (file.toLocaleLowerCase().endsWith('.md')) {
      return MarkdownFilter.getInstance(markdownFilterOptions).apply(source);
    }

    return source;
  };

  return {
    /**
     * Unique preprocessor ID as the module name.
     */
    id: moduleName,

    /**
     * Render template into HTML.
     * Called for rendering of template defined as entry point.
     *
     * @param {string} source The template source code.
     * @param {string} resourcePath
     * @param {{}} data
     * @return {string}
     */
    render: async
      ? (source, { resourcePath, data = {} }) => eta.renderStringAsync(source, data)
      : (source, { resourcePath, data = {} }) => eta.renderString(source, data),

    /**
     * Compile template into template function.
     * Called when a template is loaded in JS in `compile` mode.
     *
     * @param {string} source The template source code.
     * @param {string} resourcePath
     * @param {{}} data
     * @return {string}
     */
    compile(source, { resourcePath, data = {} }) {
      const varName = options.varName || 'it';
      const eta = new Eta({
        useWith: true, // allow using variables in template without `it.` namespace
        ...options,
        views,
      });

      let templateFunctionBody = eta
        .compileToString(source)
        .replaceAll(includeRegexp, `=require($1)({...${varName}, ...{$2}})`);

      return `function(${varName}){${templateFunctionBody}}`;
    },

    /**
     * Export the compiled template function contained resolved source asset files.
     * Note: this method is required for `compile` mode.
     *
     * @param {string} templateFunction The source code of the template function.
     * @param {{}} data The object with external variables passed in template from data option.
     * @return {string} The exported template function.
     */
    export(templateFunction, { data }) {
      // resolved the file is for node, therefore, we need to get the module path plus file for browser,
      const modulePath = require.resolve('eta');
      // fix windows-like path into the posix standard :-/
      const runtimeFile = path.join(path.dirname(modulePath), 'browser.module.mjs').replace(/\\/g, '/');
      const exportFunctionName = 'templateFn';
      const exportCode = 'module.exports=';

      return `
        var { Eta } = require('${runtimeFile}');
        var eta = new Eta(${stringifyJSON(options)});
        var data = ${stringifyJSON(data)};
        var etaFn = ${templateFunction};
        var ${exportFunctionName} = (context) => etaFn.bind(eta)(Object.assign({}, data, context));
        ${exportCode}${exportFunctionName};`;
    },
  };
};

module.exports = preprocessor;
module.exports.test = /\.(html|eta)$/i;
