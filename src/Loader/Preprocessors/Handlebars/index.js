const path = require('path');
const LoaderFactory = require('../../LoaderFactory');
const { stringifyJSON, stringifyFn } = require('../../Utils');
const { loadModule, readDirRecursiveSync } = require('../../../Common/FileUtils');
const { isWin, pathToPosix } = require('../../../Common/Helpers');

// node module name
const moduleName = 'handlebars';

/**
 * Compile source template including all partials and helpers.
 *
 * @param {string} source The source code of the root template.
 * @param {object} options
 * @param {import('handlebars')} options.Handlebars The instance of Handlebars.
 * @param {object} options.handlebarsOptions The handlebars options.
 * @param {{string: Function}} options.knownHelpers A set of known helper names.
 * @param {string} options.resourcePath The request of template.
 * @returns {{
 *   helpers: Set<string>,
 *   partials: Set<string>,
 *   rootAst: object,
 *   partialAsts: Object<name: string, ast: object>,
 *   precompiledTemplate: string,
 *   precompiledHelpers: string,
 * }} Used helpers, partial names, and a map of parsed ASTs for all used partials.
 */
function compileSource(source, { Handlebars, handlebarsOptions, knownHelpers, resourcePath }) {
  const visitedPartials = new Set();
  const collectedHelpers = new Set();
  const collectedPartials = new Set();
  const partialAsts = {};
  let precompiledPartials = '';
  let precompiledHelpers = '';

  const knownPartials = Handlebars.partials;
  const knownHelperNames = new Set([...Object.keys(knownHelpers)]);

  function processAst(ast) {
    const { helpers, partials } = findUsedHelpersAndPartials(ast, knownHelperNames);

    for (const helper of helpers) {
      if (!collectedHelpers.has(helper)) {
        collectedHelpers.add(helper);
        const helperSource = stringifyFn(knownHelpers[helper]);
        precompiledHelpers += `Handlebars.registerHelper('${helper}', ${helperSource});`;
      }
    }

    for (const partial of partials) {
      if (!visitedPartials.has(partial)) {
        collectedPartials.add(partial);
        walkPartial(partial);
      }
    }
  }

  function walkPartial(name) {
    let partialSource = knownPartials[name];
    if (typeof partialSource == 'function') {
      // Handlebars.precompile requires a string.
      // However, if a partial is used in both a Handlebars template and a JS template,
      // it may already be compiled into a function.
      // In that case, we retrieve the original source from the `_partialSources` property,
      // where it was previously saved in `updatePartials()`.
      partialSource = Handlebars._partialSources[name];
    }
    if (!partialSource) return;

    let ast;
    try {
      ast = Handlebars.parse(partialSource);
      partialAsts[name] = ast;
    } catch (err) {
      throw new Error(`Failed to parse partial "${name}": ${err.message}`);
    }

    if (!visitedPartials.has(name)) {
      let compiled;
      try {
        compiled = Handlebars.precompile(ast, handlebarsOptions);
      } catch (error) {
        let message = `Could not compile partial '${name}', in the template: ${resourcePath}`;
        throw new Error(message + '\n' + error.toString());
      }

      // normalize the partial name to a safe JavaScript variable name
      const varName = 'partial_' + name.replace(/[^a-zA-Z0-9_]/g, '_');
      precompiledPartials += `var ${varName} = ${compiled};Handlebars.partials['${name}'] = Handlebars.template(${varName});`;
    }
    visitedPartials.add(name);
    processAst(ast);
  }

  // parse and process the root template source
  let precompiledRootTemplate;
  let rootAst;

  try {
    rootAst = Handlebars.parse(source);
  } catch (err) {
    throw new Error(`Failed to parse the template "${resourcePath}": ${err.message}`);
  }
  try {
    precompiledRootTemplate = Handlebars.precompile(rootAst, handlebarsOptions);
  } catch (err) {
    throw new Error(`Failed to precompile the template "${resourcePath}": ${err.message}`);
  }

  processAst(rootAst);

  const precompiledTemplate = `${precompiledPartials}var precompiledTemplate = ${precompiledRootTemplate};`;

  return {
    helpers: collectedHelpers,
    partials: collectedPartials,
    rootAst,
    partialAsts,
    precompiledTemplate,
    precompiledHelpers,
  };
}

/**
 * Find all used helpers and partials in Handlebars AST.
 *
 * @param {object} ast - The Handlebars AST returned by Handlebars.parse().
 * @param {Set<string>} knownHelpers - A set of known helper names.
 * @returns {{ helpers: Set<string>, partials: Set<string> }} Object with used helpers and partials.
 */
function findUsedHelpersAndPartials(ast, knownHelpers) {
  const usedHelpers = new Set();
  const usedPartials = new Set();

  function walk(node) {
    if (!node || typeof node !== 'object') return;

    const type = node.type;

    // helpers: detect in Mustache, Block, SubExpression
    if (node.path?.original && ['MustacheStatement', 'BlockStatement', 'SubExpression'].includes(type)) {
      const name = node.path.original;
      if (knownHelpers.has(name)) {
        usedHelpers.add(name);
      }
    }

    // partials: {{> name}} or {{#> name}}
    if (node.name?.original && ['PartialStatement', 'PartialBlockStatement'].includes(type)) {
      usedPartials.add(node.name.original);
    }

    // walk children
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value)) {
        value.forEach(walk);
      } else if (value && typeof value === 'object') {
        walk(value);
      }
    }
  }

  walk(ast);

  return {
    helpers: usedHelpers,
    partials: usedPartials,
  };
}

/**
 * Preprocessor Handlebars.
 *
 * @param {object} loaderContext
 * @param {object} options
 * @return {{id: string, render(string, {resourcePath: string, data?: Object}): string, compile(string, {resourcePath: string}): string, export(string, {data: {}}): string, watch(): void, shutdown(): void}|*|string}
 */
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
  let allHelpers = {};
  let partials = {};
  let precompiledHelpers = '';

  // built-in helpers which are available in runtime
  const assign = require('./helpers/assign')(Handlebars);
  const block = require('./helpers/block/block')(Handlebars);
  const partial = require('./helpers/block/partial')(Handlebars);
  const include = require('./helpers/include')({
    Handlebars,
    fs,
    root,
    views: Array.isArray(views) ? views : [views],
    extensions,
  });

  //const builtInRuntimeHelpers = { assign, block, partial };
  const builtInHelpers = {
    include,
    assign,
    block,
    partial,
  };

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

      if (!('_partialSources' in Handlebars)) {
        Handlebars._partialSources = {};
      }
      Handlebars._partialSources[name] = template;
    }
  };

  /**
   * Update helpers after changes in watch/serve mode.
   *
   * @return {Object<name: string, helper: Function>} Return registered helpers.
   */
  const updateHelpers = () => {
    if (!options.helpers || !Array.isArray(options.helpers)) return;

    const newHelpers = getHelpers(options.helpers);
    const oldNames = Object.keys(helpers);
    const newNames = Object.keys(newHelpers);
    const outdatedHelperNames = oldNames.filter((name) => !newNames.includes(name));
    const registeredHelpers = {};

    // remove deleted/renamed helpers
    outdatedHelperNames.forEach((name) => {
      dependency.removeFile(helpers[name]);
      Handlebars.unregisterHelper(name);
    });

    helpers = newHelpers;

    for (const name in newHelpers) {
      const helperFile = newHelpers[name];

      // watch changes in a file (change/rename)
      dependency.addFile(helperFile);

      if (!fs.existsSync(helperFile)) {
        throw new Error(`Could not find the helper '${helperFile}'`);
      }

      const helper = require(helperFile);
      Handlebars.registerHelper(name, helper);
      registeredHelpers[name] = helper;
    }

    return registeredHelpers;
  };

  // first, register built-in helpers
  //Object.assign(builtInHelpers, builtInRuntimeHelpers);

  Handlebars.registerHelper(builtInHelpers);
  Object.assign(allHelpers, builtInHelpers);

  // seconds, register user helpers, built-in helpers can be overridden with custom helpers
  let customHelpers;
  if (options.helpers) {
    if (Array.isArray(options.helpers)) {
      customHelpers = updateHelpers();
    } else {
      Handlebars.registerHelper(options.helpers);
      customHelpers = options.helpers;
    }
  }

  if (customHelpers) {
    Object.assign(allHelpers, customHelpers);
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
     * TODO: add support for custom helpers used file system, e.g. `include` if is it possible
     *
     * @param {string} source The template source code.
     * @param {string} resourcePath The request of template.
     * @return {string}
     */
    compile(source, { resourcePath }) {
      const res = compileSource(source, {
        Handlebars,
        handlebarsOptions: options,
        knownHelpers: allHelpers,
        resourcePath,
      });

      // save in closure for using in export
      precompiledHelpers = res.precompiledHelpers;

      return res.precompiledTemplate;
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
