const path = require('path');
const { loadModule, readDirRecursiveSync } = require('../../../Common/FileUtils');

const preprocessor = ({ fs, rootContext, options }) => {
  const Handlebars = loadModule('handlebars');
  const extensions = ['.html', '.hbs', '.handlebars'];
  const helpers = options.helpers || {};
  const root = options?.root || rootContext;
  let views = options?.views || rootContext;
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

  if (!Array.isArray(views)) views = [views];

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
      // array of absolute paths contained partials
      for (const partialPath of options.partials) {
        const files = readDirRecursiveSync(partialPath, { fs });
        files.forEach((file) => {
          const relativeFile = path.relative(partialPath, file);
          const id = relativeFile.slice(0, relativeFile.lastIndexOf('.'));
          partials[id] = file;
        });
      }
    } else {
      // object of partial name => absolute path to partial file
      partials = options.partials;
    }

    for (const partial in partials) {
      const partialFile = partials[partial];
      if (!fs.existsSync(partialFile)) {
        throw new Error(`Could not find the partial file '${partialFile}'`);
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
     * Called before each compilation in watch/serv mode.
     */
    watch: updatePartials,
  };
};

module.exports = preprocessor;
