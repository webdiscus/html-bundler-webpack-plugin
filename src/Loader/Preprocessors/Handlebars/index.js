const path = require('path');
const Dependency = require('../../Dependency');
const { escapeSequences, stringifyData } = require('../../Utils');
const { loadModule, readDirRecursiveSync } = require('../../../Common/FileUtils');
const { isWin, pathToPosix } = require('../../../Common/Helpers');

const preprocessor = (loaderContext, options) => {
  const Handlebars = loadModule('handlebars');
  const fs = loaderContext.fs.fileSystem;
  const { rootContext } = loaderContext;
  const extensions = ['.html', '.hbs', '.handlebars'];
  const includeFiles = [/\.(html|hbs|handlebars)$/i];
  const root = options?.root || rootContext;
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
      Dependency.addDir(dir);
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
      Dependency.removeFile(partials[name]);
      Handlebars.unregisterPartial(name);
    });

    partials = actualPartials;

    // update content of actual partials
    for (const name in partials) {
      const partialFile = partials[name];

      // watch changes in a file (change/rename)
      Dependency.addFile(partialFile);

      if (!fs.existsSync(partialFile)) {
        throw new Error(`Could not find the partial '${partialFile}'`);
      }

      const template = fs.readFileSync(partialFile, 'utf8');
      Handlebars.registerPartial(name, template);
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
      Dependency.removeFile(helpers[name]);
      Handlebars.unregisterHelper(name);
    });

    helpers = actualHelpers;

    for (const name in helpers) {
      const helperFile = helpers[name];

      // watch changes in a file (change/rename)
      Dependency.addFile(helperFile);

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

  const fnName = 'templateFn';
  const exportCode = 'module.exports=';

  return {
    externalData: '{}',

    /**
     * Render template to HTML.
     * Called in the `render` preprocessor mode.
     *
     * @param {string} template The template content.
     * @param {string} resourcePath The request of template.
     * @param {object} data The data passed into template.
     *  Note:
     *  call compiled function with the argument as new object
     *  to allow defining properties in `this` of some helpers.
     * @return {string}
     */
    render: (template, { resourcePath, data = {} }) => Handlebars.compile(template, options)({ ...data }),

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
      let precompiledTemplate = Handlebars.precompile(template);

      this.externalData = stringifyData(data);

      return precompiledTemplate;
    },

    /**
     * Export the compiled template function contained resolved source asset files.
     * Note: this method is required for `compile` mode.
     *
     * @param {string} precompiledTemplate The source code of the precompiled template function.
     * @return {string} The exported template function.
     */
    export: (precompiledTemplate) => {
      const runtimeFile = require.resolve('handlebars/dist/handlebars.runtime.min');

      return `
        var Handlebars = require('${runtimeFile}');
        var __data__ = ${this.externalData};
        var precompiledTemplate = ${precompiledTemplate};
        var ${fnName} = (locals) => {
          var template = (Handlebars['default'] || Handlebars).template(precompiledTemplate);
          return template(Object.assign(__data__, locals));
        };
        ${exportCode} ${fnName};`;
    },

    /**
     * Called before each new compilation after changes, in the serve/watch mode.
     */
    watch: () => {
      updateHelpers();
      updatePartials();
    },
  };
};

module.exports = preprocessor;
