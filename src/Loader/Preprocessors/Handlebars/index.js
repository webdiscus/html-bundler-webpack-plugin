const path = require('path');
const { loadModule, readDirRecursiveSync } = require('../../../Common/FileUtils');
const { isWin, pathToPosix } = require('../../../Common/Helpers');

const preprocessor = ({ fs, rootContext, options }) => {
  const Handlebars = loadModule('handlebars');
  const extensions = ['.html', '.hbs', '.handlebars'];
  const root = options?.root || rootContext;
  let views = options?.views || rootContext;
  let helpers = {};
  let partials = {};

  /**
   * Update cached partials.
   */
  const updatePartials = () => {
    for (const partial in partials) {
      const partialFile = partials[partial];
      const template = fs.readFileSync(partialFile, 'utf8');
      Handlebars.registerPartial(partial, template);
    }
  };

  const getEntries = (dirs) => {
    const result = {};
    for (let dir of dirs) {
      if (!path.isAbsolute(dir)) {
        dir = path.join(rootContext, dir);
      }
      const files = readDirRecursiveSync(dir, { fs });
      files.forEach((file) => {
        const relativeFile = path.relative(dir, file);
        let id = relativeFile.slice(0, relativeFile.lastIndexOf('.'));
        if (isWin) id = pathToPosix(id);
        result[id] = file;
      });
    }

    return result;
  };

  if (!Array.isArray(views)) views = [views];

  if (options.helpers) {
    if (Array.isArray(options.helpers)) {
      const files = getEntries(options.helpers);
      for (const name in files) {
        const file = files[name];
        if (!fs.existsSync(file)) {
          throw new Error(`Could not find the helper '${file}'`);
        }
        helpers[name] = require(file);
      }
    } else {
      // object of helper name => absolute path to helper file
      helpers = options.helpers;
    }
  }

  // build-in helpers
  if (!helpers.include) {
    helpers.include = require('./helpers/include')({
      fs,
      Handlebars,
      root,
      views,
      extensions,
    });
  }

  for (const helper in helpers) {
    Handlebars.registerHelper(helper, helpers[helper]);
  }

  if (options.partials) {
    if (Array.isArray(options.partials)) {
      partials = getEntries(options.partials);
    } else {
      // object of partial name => absolute path to partial file
      partials = options.partials;
    }

    for (const partial in partials) {
      const partialFile = partials[partial];
      if (!fs.existsSync(partialFile)) {
        throw new Error(`Could not find the partial '${partialFile}'`);
      }

      const template = fs.readFileSync(partialFile, 'utf8');
      Handlebars.registerPartial(partial, template);
    }
  }

  return {
    /**
     * Called to render each template page
     * @param {string} template The template content.
     * @param {string} resourcePath The request of template.
     * @param {object} data The data passed into template.
     * @return {string}
     */
    render: (template, { resourcePath, data = {} }) => Handlebars.compile(template, options)(data),

    /**
     * Called before each new compilation after changes, in the serve/watch mode.
     */
    watch: updatePartials,
  };
};

module.exports = preprocessor;
