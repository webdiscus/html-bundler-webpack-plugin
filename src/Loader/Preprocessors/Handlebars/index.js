const path = require('path');
const { loadModule, readDirRecursiveSync } = require('../../../Common/FileUtils');

const HandlebarsPreprocessor = ({ fs, rootContext, options }) => {
  const Handlebars = loadModule('handlebars');
  const extensions = ['.html', '.hbs', '.handlebars'];
  const helpers = options.helpers || {};
  const root = options?.root || rootContext;
  let views = options?.views || rootContext;

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
    let partials = {};

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

  return (template, { data = {} }) => Handlebars.compile(template, options)(data);
};

module.exports = HandlebarsPreprocessor;
