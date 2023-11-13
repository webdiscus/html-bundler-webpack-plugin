const path = require('path');
const { stringifyData } = require('../../Utils');
const { loadModule } = require('../../../Common/FileUtils');

const preprocessor = (loaderContext, options = {}, watch) => {
  const nunjucks = loadModule('nunjucks');
  const env = new nunjucks.Environment();
  const { rootContext } = loaderContext;
  const viewPaths = (options.views = [...new Set([...(options.views || []), rootContext])]);
  const async = options?.async === true;
  const fnName = 'templateFn';
  const exportCode = 'module.exports=';

  if (watch === true) {
    // enable to watch changes in serve/watch mode
    options.noCache = true;
    // disable the nunjucks watch, because we use Webpack watch
    options.watch = false;
  }

  if (options.jinjaCompatibility === true) {
    // installs experimental support for more consistent Jinja compatibility
    // see https://mozilla.github.io/nunjucks/api.html#installjinjacompat
    nunjucks.installJinjaCompat();
  }

  // set root template dirs, see the options https://mozilla.github.io/nunjucks/api.html#configure
  nunjucks.configure(viewPaths, options);

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
    render: async
      ? (content, { data }) =>
          new Promise((resolve, reject) => {
            nunjucks.renderString(content, data, (error, result) => {
              if (!error) resolve(result);
              else reject(error);
            });
          })
      : (template, { data = {} }) => nunjucks.renderString(template, data),

    /**
     * Compile template into template function.
     * Called when a template is imported in JS in `compile` mode.
     *
     * @param {string} template
     * @param {string} resourcePath
     * @param {{}} data
     * @return {string}
     */
    compile: (template, { resourcePath, data }) => {
      // the template name must be unique, e.g. partial file, to allow import many partials in the same js
      const templateName = path.relative(rootContext, resourcePath);

      let precompiledTemplate = nunjucks.precompileString(template, {
        env,
        name: templateName,
        asFunction: false,
      });

      const dependenciesRegExp = /env\.getTemplate\(\"(.*?)\"/g;
      const matches = precompiledTemplate.matchAll(dependenciesRegExp);
      const requiredTemplates = new Set();
      let dependencies = '';

      this.externalData = stringifyData(data);

      for (const [, templateFile] of matches) {
        if (requiredTemplates.has(templateFile)) continue;

        // try to resolve the template file in multiple paths
        const file = require.resolve(templateFile, { paths: viewPaths });

        if (file) {
          // unique template name
          const templateName = path.relative(rootContext, file);
          dependencies += `dependencies["${templateName}"] = require("${file}");`;

          // if used partial paths (defined in `views` option) to include a partial,
          // replace the required partial file with the real partial name, e.g.:
          // "partials/footer.html" -> "src/partials/footer.html"
          if (templateFile !== templateName) {
            precompiledTemplate = precompiledTemplate.replaceAll(
              `env.getTemplate("${templateFile}"`,
              `env.getTemplate("${templateName}"`
            );
          }
        }

        requiredTemplates.add(templateFile);
      }

      if (dependencies) {
        precompiledTemplate +=
          'var dependencies = nunjucks.dependencies || (nunjucks.dependencies = {});' + dependencies;
      }

      return (
        precompiledTemplate +
        `;var ${fnName} = (locals) => nunjucks.render("${templateName}", Object.assign(__data__, locals));`
      );
    },

    /**
     * Export the compiled template function contained resolved source asset files.
     * Note: this method is required for `compile` mode.
     *
     * @param {string} precompiledTemplate The source code of the precompiled template function.
     * @return {string} The exported template function.
     */
    export: (precompiledTemplate) => {
      const runtimeFile = require.resolve('nunjucks/browser/nunjucks-slim.min');

      return `
        var nunjucks = require('${runtimeFile}');
        var __data__ = ${this.externalData};
        ${precompiledTemplate};
        ${exportCode} ${fnName};`;
    },
  };
};

module.exports = preprocessor;
