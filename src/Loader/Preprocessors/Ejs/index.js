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
    externalData: '{}',

    /**
     * Render template into HTML.
     * Called for rendering of template defined as entry point.
     *
     * @param {string} template
     * @param {string} resourcePath
     * @param {{}} data
     * @return {string}
     */
    render: (template, { resourcePath, data = {} }) =>
      Ejs.render(template, data, {
        async: false,
        root: rootContext, // root path for includes with an absolute path (e.g., /file.html)
        ...options,
        filename: resourcePath, // allow including a partial relative to the template
      }),

    /**
     * Compile template into template function.
     * Called when a template is loaded in JS in `compile` mode.
     *
     * @param {string} template
     * @param {string} resourcePath
     * @param {{}} data
     * @return {string}
     */
    compile: (template, { resourcePath, data = {} }) => {
      let source = Ejs.compile(template, {
        client: true,
        compileDebug: false,
        root: rootContext, // root path for includes with an absolute path (e.g., /file.html)
        ...options,
        async: false, // for client is used the sync function
        filename: resourcePath, // allow including a partial relative to the template
      }).toString();

      this.externalData = stringifyData(data);

      return source.replace(`var __output = "";`, 'locals = Object.assign(__data__, locals); var __output = "";');
    },

    /**
     * Export the compiled template function contained resolved source asset files.
     * Note: this method is required for `compile` mode.
     *
     * @param {string} content The source code of the template function.
     * @return {string} The exported template function.
     */
    export: (content) => {
      // the name of template function in generated code
      const fnName = 'anonymous';
      const exportCode = 'module.exports=';

      return `var __data__ = ${this.externalData};` + content + `;${exportCode}${fnName};`;
    },
  };
};

module.exports = preprocessor;
