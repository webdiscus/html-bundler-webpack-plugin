const { stringifyJSON } = require('../../Utils');
const PugCompiler = require('./PugCompiler');

/**
 * Transform the raw template source to a template function or HTML.
 *
 * @param {BundlerPluginLoaderContext} loaderContext
 * @param {{}} options The loader options.
 * @param {boolean} esModule Whether is ESM mode.
 * @param {boolean} watch Whether is serve/watch mode.
 * @return {{compile: (function(string, {resourcePath: string, data?: {}}): *), render: (function(string, {resourcePath: string, data?: {}}): *), export: (function(string, {data: {}}): string)}}
 */
const preprocessor = (loaderContext, options, { esModule, watch }) => {
  const exportCode = esModule ? 'export default ' : 'module.exports=';
  const Pug = new PugCompiler(loaderContext, options);

  return {
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
      return Pug.render(source, { file: resourcePath, data, esModule });
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
      return Pug.compile(source, { file: resourcePath, data });
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
      const functionName = 'templateFn';
      const exportFunctionName = 'exportFn';

      if (!Object.keys(data).length) {
        return `${templateFunction};${exportCode}${functionName};`;
      }

      return `${templateFunction};
        var data = ${stringifyJSON(data)};
        var ${exportFunctionName} = (context) => ${functionName}(Object.assign(data, context));
        ${exportCode}${exportFunctionName};`;
    },
  };
};

module.exports = preprocessor;
module.exports.test = /\.(pug|jade)$/;
