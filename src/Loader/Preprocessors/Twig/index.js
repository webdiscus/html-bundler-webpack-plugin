const path = require('path');
const { eachAsync, makeTemplateId, stringifyData } = require('../../Utils');
const { loadModule } = require('../../../Common/FileUtils');

const preprocessor = (loaderContext, options) => {
  const TwigEngine = loadModule('twig', () => require('twig'));
  const Twig = TwigEngine.twig;
  const rootContext = loaderContext.rootContext || process.cwd();
  const async = options?.async === true;
  const dependencies = new Set();
  let template = {};

  /**
   * Resolve absolute paths in token values.
   *
   * @param {Object} token The template token.
   * @return {Promise<void>}
   */
  const resolveDependency = async (token) => {
    // if the `namespaces` twig option contains not absolute path, then a parsed path is the path relative to root context
    const filePath = TwigEngine.path.parsePath(template, token.value);
    const file = path.isAbsolute(filePath) ? filePath : path.resolve(rootContext, filePath);

    token.value = makeTemplateId(rootContext, file);
    dependencies.add(file);
    loaderContext.addDependency(file);
  };

  /**
   * Walk through the token tree and resolve include/extends.
   *
   * @param {Object} token The template token.
   * @return {Promise<void>}
   */
  const processToken = async (token) => {
    if (token.type !== 'logic' || !token.token.type) {
      return;
    }

    switch (token.token.type) {
      case 'Twig.logic.type.apply':
      case 'Twig.logic.type.block':
      case 'Twig.logic.type.if':
      case 'Twig.logic.type.elseif':
      case 'Twig.logic.type.else':
      case 'Twig.logic.type.for':
      case 'Twig.logic.type.macro':
      case 'Twig.logic.type.spaceless':
      case 'Twig.logic.type.setcapture': {
        await eachAsync(token.token.output, processToken);
        break;
      }

      case 'Twig.logic.type.extends':
      case 'Twig.logic.type.include': {
        await eachAsync(token.token.stack, resolveDependency);
        break;
      }

      case 'Twig.logic.type.embed': {
        await eachAsync(token.token.output, processToken);
        await eachAsync(token.token.stack, resolveDependency);
        break;
      }

      case 'Twig.logic.type.import':
      case 'Twig.logic.type.from':
        if (token.token.expression !== '_self') {
          await eachAsync(token.token.stack, resolveDependency);
        }
        break;
    }
  };

  TwigEngine.cache(false);

  return {
    /**
     * Render template into HTML.
     * Called for rendering of template defined as entry point.
     *
     * @param {string} source The template source.
     * @param {string} resourcePath
     * @param {{}} data
     * @return {string}
     */
    render: (source, { resourcePath, data = {} }) => {
      const twigOptions = {
        ...options,
        async,
        data: source,
      };

      return Twig(twigOptions).render(data);
    },

    /**
     * Compile template into template function.
     * Called when a template is loaded in JS in `compile` mode.
     *
     * @param {string} source The template source code.
     * @param {BundlerPluginLoaderContext} loaderContext
     * @return {Promise}
     */
    compile: (source, loaderContext) => {
      const { resourcePath, data = {} } = loaderContext;

      return new Promise((resolve, reject) => {
        const twigOptions = {
          ...options,
          async,
          id: makeTemplateId(rootContext, resourcePath),
          path: resourcePath,
          data: source,
          allowInlineIncludes: true,
          rethrow: true,
        };

        // set global `template` variable used in an async function defined in global scope
        template = Twig(twigOptions);

        eachAsync(template.tokens, processToken).then(() => {
          const twigOptions = {
            id: template.id,
            data: template.tokens,
            allowInlineIncludes: true,
            rethrow: true,
            precompiled: true,
          };
          const precompiledTemplate = JSON.stringify(twigOptions);

          resolve(precompiledTemplate);
        });
      });
    },

    /**
     * Export the compiled template function contained resolved source asset files.
     * Note: this method is required for `compile` mode.
     *
     * @param {string} precompiledTemplate The code of the precompiled template.
     * @param {{}} data The object with variables passed in template.
     * @param {boolean} hot
     * @return {string} The exported template function.
     */
    export: (precompiledTemplate, { data, hot }) => {
      const runtimeFile = require.resolve('twig/twig.min.js');
      const exportFunction = 'templateFn';
      const exportCode = 'module.exports=';
      let loadDependencies = '';

      for (let dep of dependencies) {
        loadDependencies += `require('${dep}');`;
      }

      return `${loadDependencies}
        var Twig = require('${runtimeFile}');
        ${hot === true ? `Twig.cache(false);` : ''}
        var __data__ = ${stringifyData(data)};
        var template = Twig.twig(${precompiledTemplate});
        var ${exportFunction} = (context) => template.render(Object.assign(__data__, context));
        ${exportCode}${exportFunction};`;
    },
  };
};

module.exports = preprocessor;
