const path = require('path');
const LoaderFactory = require('../../LoaderFactory');
const { stringifyJSON, stringifyFn } = require('../../Utils');
const { loadModule, readDirRecursiveSync } = require('../../../Common/FileUtils');
const { isWin, pathToPosix } = require('../../../Common/Helpers');

// node module name
const moduleName = 'handlebars';

const preprocessor = (loaderContext, options) => {
  const Handlebars = loadModule(moduleName);
  const fs = loaderContext.fs.fileSystem;
  const { rootContext } = loaderContext;
  const dependency = LoaderFactory.getDependency(loaderContext._compilation.compiler);
  const extensions = ['.html', '.hbs', '.handlebars'];
  const includeFiles = [/\.(html|hbs|handlebars)$/i];
  const root = options?.root || rootContext;
  const runtime = options?.runtime || 'handlebars/runtime';
  // fix windows-like path
  const runtimeFile = require.resolve(runtime).replace(/\\/g, '/');
  let views = options?.views || rootContext;
  let helpers = {};
  let partials = {};

  /**
   * Read files in the directories.
   *
   * @param {Array<string>} dirs The directories in which to read the list of files.
   * @param {Array<RegExp>|undefined} includes The filter to include only files matching RegExps.
   *  If the value is undefined, ignore the filter.
   * @return {{}}
   */
  const getEntries = (dirs, includes = undefined) => {
    const result = {};

    for (let dir of dirs) {
      if (!path.isAbsolute(dir)) {
        dir = path.join(rootContext, dir);
      }
      const files = readDirRecursiveSync(dir, { fs, includes });

      files.forEach((file) => {
        const relativeFile = path.relative(dir, file);
        let id = relativeFile.slice(0, relativeFile.lastIndexOf('.'));
        if (isWin) id = pathToPosix(id);
        result[id] = file;
      });

      // watch changes in the directory (add/remove a file)
      dependency.addDir(dir);
    }

    return result;
  };

  /**
   * Get actual partials.
   *
   * @param {Array<string>|{}} options The partial's option.
   * @return {{}}
   */
  const getPartials = (options) => {
    return Array.isArray(options)
      ? // read partial files
        getEntries(options, includeFiles)
      : // object of partial name => absolute path to partial file
        options;
  };

  /**
   * Get actual helpers.
   *
   * @param {Array<string>|{}} options The helper's option.
   * @return {{}}
   */
  const getHelpers = (options) => {
    return Array.isArray(options)
      ? // read helper files
        getEntries(options, [/\.(js)$/])
      : // object of helper name => absolute path to helper file
        options;
  };

  /**
   * Update partials after changes in watch/serve mode.
   */
  const updatePartials = () => {
    if (!options.partials) return;

    const actualPartials = getPartials(options.partials);
    const oldNames = Object.keys(partials);
    const newNames = Object.keys(actualPartials);
    const outdatedPartialsNames = oldNames.filter((name) => !newNames.includes(name));

    // remove deleted/renamed partials
    outdatedPartialsNames.forEach((name) => {
      dependency.removeFile(partials[name]);
      Handlebars.unregisterPartial(name);
    });

    partials = actualPartials;

    // update content of actual partials
    for (const name in partials) {
      const partialFile = partials[name];

      // watch changes in a file (change/rename)
      dependency.addFile(partialFile);

      if (!fs.existsSync(partialFile)) {
        throw new Error(`Could not find the partial '${partialFile}'`);
      }

      const template = fs.readFileSync(partialFile, 'utf8');
      Handlebars.registerPartial(name, template);

      if (!('_sourcePartials' in Handlebars)) {
        Handlebars._sourcePartials = {};
      }
      Handlebars._sourcePartials[name] = template;
    }
  };

  /**
   * Update helpers after changes in watch/serve mode.
   */
  const updateHelpers = () => {
    if (!options.helpers || !Array.isArray(options.helpers)) return;

    const actualHelpers = getHelpers(options.helpers);
    const oldNames = Object.keys(helpers);
    const newNames = Object.keys(actualHelpers);
    const outdatedHelperNames = oldNames.filter((name) => !newNames.includes(name));

    // remove deleted/renamed helpers
    outdatedHelperNames.forEach((name) => {
      dependency.removeFile(helpers[name]);
      Handlebars.unregisterHelper(name);
    });

    helpers = actualHelpers;

    for (const name in helpers) {
      const helperFile = helpers[name];

      // watch changes in a file (change/rename)
      dependency.addFile(helperFile);

      if (!fs.existsSync(helperFile)) {
        throw new Error(`Could not find the helper '${helperFile}'`);
      }

      const helper = require(helperFile);
      Handlebars.registerHelper(name, helper);
    }
  };

  // first, register build-in helpers
  const buildInHelpers = {
    assign: require('./helpers/assign')(Handlebars),
    block: require('./helpers/block/block')(Handlebars),
    partial: require('./helpers/block/partial')(Handlebars),
    include: require('./helpers/include')({
      Handlebars,
      fs,
      root,
      views: Array.isArray(views) ? views : [views],
      extensions,
    }),
  };

  Handlebars.registerHelper(buildInHelpers);

  // seconds, register user helpers, build-in helpers can be overridden with custom helpers
  if (options.helpers) {
    if (Array.isArray(options.helpers)) {
      updateHelpers();
    } else {
      Handlebars.registerHelper(options.helpers);
    }
  }

  if (options.partials) {
    updatePartials();
  }

  return {
    /**
     * Unique preprocessor ID as the module name.
     */
    id: moduleName,

    /**
     * Render template to HTML.
     * Called in the `render` preprocessor mode.
     *
     * @param {string} source The template source code.
     * @param {string} resourcePath The request of template.
     * @param {object} data The data passed into template.
     *  Note:
     *  call compiled function with the argument as new object
     *  to allow defining properties in `this` of some helpers.
     * @return {string}
     */
    render(source, { resourcePath, data = {} }) {
      return Handlebars.compile(source, options)({ ...data });
    },

    /**
     * Compile template into template function.
     * Called when a template is loaded in JS in `compile` mode.
     *
     * TODO: add support for custom helpers used file system, e.g. `include`
     *
     * @param {string} source The template source code.
     * @param {string} resourcePath The request of template.
     * @return {string}
     */
    compile(source, { resourcePath }) {
      let precompiledPartials = '';

      for (const name in Handlebars.partials) {
        let source = Handlebars.partials[name];
        let compiled;

        try {
          if (typeof source == 'function') {
            // Handlebars.precompile requires a string.
            // However, if a partial is used in both a Handlebars template and a JS template,
            // it may already be compiled into a function.
            // In that case, we retrieve the original source from the `_sourcePartials` property,
            // where it was previously saved in `updatePartials()`.
            source = Handlebars._sourcePartials[name];
          }
          compiled = Handlebars.precompile(source, options);
        } catch (error) {
          let message = `Could not compile partial '${name}', in the template: ${resourcePath}`;
          throw new Error(message + '\n' + error.toString());
        }

        // normalize the name to variable-safe name
        const varName = 'partial_' + name.replace(/[\/-]/g, '_');

        precompiledPartials += `
        var ${varName} = ${compiled};
        Handlebars.partials['${name}'] = Handlebars.template(${varName});
        `;
      }

      let precompiledTemplate = Handlebars.precompile(source, options);

      return `
        ${precompiledPartials}
        var precompiledTemplate = ${precompiledTemplate};
        `;
    },

    /**
     * Export the compiled template function contained resolved source asset files.
     * Note: this method is required for `compile` mode.
     *
     * @param {string} precompiledTemplate The source code of the precompiled template function.
     * @param {{}} data The object with external variables passed in template from data option.
     * @return {string} The exported template function.
     */
    export(precompiledTemplate, { data }) {
      const exportFunctionName = 'templateFn';
      const exportCode = 'module.exports=';
      let precompiledHelpers = '';

      if (options.helpers || Array.isArray(options.helpers)) {
        const helpers = getHelpers(options.helpers);

        for (let name in helpers) {
          let helper = helpers[name];
          let source = stringifyFn(helper);

          precompiledHelpers += `
          Handlebars.registerHelper('${name}', ${source});`;
        }
      }

      return `
        var Handlebars = require('${runtimeFile}');
        var data = ${stringifyJSON(data)};
        ${precompiledHelpers}
        ${precompiledTemplate}
        var ${exportFunctionName} = (context) => {
          var template = (Handlebars.default || Handlebars).template(precompiledTemplate);
          return template(Object.assign({}, data, context));
        };
        ${exportCode}${exportFunctionName};`;
    },

    /**
     * Called before each new compilation after changes, in the serve/watch mode.
     */
    watch() {
      updateHelpers();
      updatePartials();
    },

    /**
     * Called when the webpack compiler is closing.
     * Reset cached states, needed for tests.
     */
    shutdown() {
      Handlebars.partials = {};
    },
  };
};

module.exports = preprocessor;
module.exports.test = /\.(html|hbs|handlebars)$/i;
