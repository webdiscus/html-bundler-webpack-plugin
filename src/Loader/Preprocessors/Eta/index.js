const path = require('path');
const { escapeSequences } = require('../../Utils');
const { loadModule } = require('../../../Common/FileUtils');
const { yellow } = require('ansis');

const compileModeWarning = () => {
  // TODO: warning
  console.log(
    yellow`[html-bundler-webpack-plugin] WARNING: Eta supports only rendering to an html string and cannot compile into a JS template function.${'\n'}You can use ESJ for using the JS template function with variables.`
  );
};

const preprocessor = (loaderContext, options) => {
  const Eta = loadModule('eta', () => require('eta').Eta);
  const { rootContext } = loaderContext;
  let views = options.views;

  if (!views) {
    views = rootContext;
  } else if (!path.isAbsolute(views)) {
    views = path.join(rootContext, views);
  }

  const eta = new Eta({
    useWith: true, // allow using variables in template without `it.` scope
    ...options,
    views, // directory that contains templates
  });

  // since eta v3 the `async` option is removed, but for compatibility, it is still used in this plugin
  // defaults is false, when is true then must be used `await includeAsync()`
  const async = options?.async === true;

  return {
    /**
     * Render template into HTML.
     * Called for rendering of template defined as entry point.
     *
     * @param {string} template
     * @param {string} resourcePath
     * @param {{}} data
     * @return {string}
     */
    render: async
      ? (template, { resourcePath, data = {} }) => {
          return eta.renderStringAsync(template, data);
        }
      : (template, { resourcePath, data = {} }) => {
          return eta.renderString(template, data);
        },

    /**
     * Compile template into template function.
     * Called when a template is loaded in JS in `compile` mode.
     *
     * Note:
     *  Eta does not compile the template into template function source code,
     *  so we compile the template into an HTML string that will be wrapped in a function for client-side compatibility.
     *
     * @param {string} template
     * @param {string} resourcePath
     * @param {{}} data
     * @return {string}
     */
    compile: async
      ? (template, { resourcePath, data = {} }) => {
          compileModeWarning();
          return eta.renderStringAsync(template, data);
        }
      : (template, { resourcePath, data = {} }) => {
          compileModeWarning();
          return eta.renderString(template, data);
        },

    /**
     * Export the compiled template function contained resolved source asset files.
     * Note: this method is required for `compile` mode.
     *
     * @param {string} content The source code of the template function.
     * @return {string} The exported template function.
     */
    export: (content) => {
      const fnName = 'templateFn';
      const exportCode = 'module.exports=';

      return `const ${fnName} = () => '` + escapeSequences(content) + `';${exportCode}${fnName};`;
    },
  };
};

module.exports = preprocessor;
