const { loadModule } = require('../../../Common/FileUtils');

const EtaPreprocessor = ({ rootContext, options }) => {
  const Eta = loadModule('eta');

  return (template, { resourcePath, data = {} }) =>
    Eta.render(template, data, {
      //async: false, // defaults is false, wenn is true then must be used `await includeFile()`
      useWith: true, // allow to use variables in template without `it.` scope
      root: rootContext, // root path for includes with an absolute path (e.g., /file.html)
      ...options,
      filename: resourcePath, // allow to include a partial relative to the template
    });
};

module.exports = EtaPreprocessor;
