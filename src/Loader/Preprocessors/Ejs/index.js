const { loadModule } = require('../../../Common/FileUtils');

const preprocessor = (loaderContext, options) => {
  const Ejs = loadModule('ejs');
  const { rootContext } = loaderContext;

  return (template, { resourcePath, data = {} }) =>
    Ejs.render(template, data, {
      async: false,
      root: rootContext, // root path for includes with an absolute path (e.g., /file.html)
      ...options,
      filename: resourcePath, // allow including a partial relative to the template
    });
};

module.exports = preprocessor;
