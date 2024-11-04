const { readFileSync } = require('fs');
const path = require('path');
const { loadModule } = require('../../../Common/FileUtils');
const { stringifyJSON } = require('../../Utils');

const currentPath = process.cwd();

// node module name
const moduleName = 'tempura';

// replace all single quotes around of require with "`", because the template function is generated using template literal
// `<img src="' + require('file.png') + '">` => `<img src="` + require('file.png') + `">`
const requireRegexp = /(?:')(\s+\+\s+require\(.+?\)\s+\+\s+)(?:')/g;

/**
 * TODO: add the feature later
 * Require CommonJS or JSON file in template.
 *
 * @param {string} file
 * @param {string} dir
 * @return {*}
 */
const requireFile = (file, dir) => {
  const fullFilePath = path.join(dir, file);

  return file.endsWith('.json') ? JSON.parse(readFileSync(fullFilePath, 'utf-8')) : require(fullFilePath);
};

/**
 * Transform the raw template source to a template function or HTML.
 *
 * @param {BundlerPluginLoaderContext} loaderContext
 * @param {{}} options
 * @return {{compile: (function(string, {resourcePath: string, data?: {}}): *), render: (function(string, {resourcePath: string, data?: {}}): *), export: (function(string, {data: {}}): string)}}
 */
const preprocessor = (loaderContext, options) => {
  const Tempura = loadModule(moduleName);
  const fs = loaderContext.fs.fileSystem;
  const { rootContext } = loaderContext;
  const extensions = ['.html', '.hbs', '.tmpr'];

  if (!options?.root) {
    options.root = currentPath;
  }

  if (!options?.views) {
    options.views = [];
  }

  if (!options.views.includes(currentPath)) {
    options.views.push(currentPath);
  }

  if (!options.views.includes(options.root)) {
    options.views.push(options.root);
  }

  if (!options?.blocks) {
    options.blocks = {};
  }

  const buildInHelpers = {
    include: require('./helpers/include')({
      Tempura,
      fs,
      root: options.root,
      views: options.views,
      extensions,
      options,
    }),
  };

  options.blocks = { ...buildInHelpers, ...options.blocks };

  const helpersString = stringifyJSON(options.blocks);

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
    render(source, { resourcePath, data = {} }) {
      options._data = data;
      const render = Tempura.compile(source, options);

      return render(data);
    },

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
      options.format = 'cjs';
      return Tempura.transform(source, options);
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
      // the name of template function in generated code
      const exportFunctionName = 'templateFn';
      const exportCode = 'module.exports=';

      templateFunction = templateFunction.replaceAll(requireRegexp, '`$1`');
      templateFunction = templateFunction.replace(';module.exports=', `;var ${exportFunctionName}=`);

      return `${templateFunction};
        var data = ${stringifyJSON(data)};
        var helpers = ${helpersString};
        ${exportCode} (context) => ${exportFunctionName}(Object.assign(data, context), helpers);`;
    },
  };
};

module.exports = preprocessor;
module.exports.test = /\.(html|hbs|tmpr)$/;
