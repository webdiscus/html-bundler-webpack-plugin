const { loadModule } = require('../../../Common/FileUtils');
const { stringifyData } = require('../../Utils');

/**
 * Transform the raw template to template function or HTML.
 *
 * @param {{}} loaderContext
 * @param {{}} options
 * @return {function(template: string, {resourcePath: string, data?: {}}, {preprocessorMode: string}): string}
 */
const preprocessor = (loaderContext, options) => {
  const Ejs = loadModule('ejs');
  const { rootContext } = loaderContext;

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
    render: (source, { resourcePath, data = {} }) =>
      Ejs.render(source, data, {
        async: false,
        root: rootContext, // root path for includes with an absolute path (e.g., /file.html)
        ...options,
        filename: resourcePath, // allow including a partial relative to the template
      }),

    /**
     * Compile template into template function.
     * Called when a template is loaded in JS in `compile` mode.
     *
     * TODO: add support for the `include`
     *
     * @param {string} source The template source code.
     * @param {string} resourcePath
     * @param {{}} data
     * @return {string}
     */
    compile: (source, { resourcePath, data = {} }) => {
      let templateFunction = Ejs.compile(source, {
        client: true,
        compileDebug: false,
        root: rootContext, // root path for includes with an absolute path (e.g., /file.html)
        ...options,
        async: false, // for client is used the sync function
        filename: resourcePath, // allow including a partial relative to the template
      }).toString();

      return templateFunction
        .replace(`var __output = "";`, 'locals = Object.assign(__data__, locals); var __output = "";')
        .replaceAll('include(', 'require(');
    },

    /**
     * Export the compiled template function contained resolved source asset files.
     * Note: this method is required for `compile` mode.
     *
     * @param {string} templateFunction The source code of the template function.
     * @param {{}} data The object with variables passed in template.
     * @return {string} The exported template function.
     */
    export: (templateFunction, { data }) => {
      // the name of template function in generated code
      const exportFunction = 'anonymous';
      const exportCode = 'module.exports=';

      return `var __data__ = ${stringifyData(data)};` + templateFunction + `;${exportCode}${exportFunction};`;
    },
  };
};

module.exports = preprocessor;
