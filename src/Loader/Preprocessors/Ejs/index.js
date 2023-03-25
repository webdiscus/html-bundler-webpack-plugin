const { loadModule } = require('../../../Common/FileUtils');

const preprocessor = ({ rootContext, options }) => {
  const Ejs = loadModule('ejs');

  return (template, { resourcePath, data = {} }) =>
    Ejs.render(template, data, {
      async: false,
      root: rootContext, // root path for includes with an absolute path (e.g., /file.html)
      ...options,
      filename: resourcePath, // allow to include a partial relative to the template
    });
};

module.exports = preprocessor;
