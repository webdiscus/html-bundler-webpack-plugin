const { loadModule } = require('../../../Common/FileUtils');

const preprocessor = ({ watch, rootContext, options }) => {
  const Nunjucks = loadModule('nunjucks');

  if (watch === true) {
    // enable watching of template changes in serv/watch mode
    Nunjucks.configure(rootContext, {
      noCache: true,
    });
  }

  if (options.async === true) {
    // async function must return a promise
    return (content, { data }) =>
      new Promise((resolve, reject) => {
        Nunjucks.renderString(content, data, (error, result) => {
          if (!error) resolve(result);
          else reject(error);
        });
      });
  }

  return (template, { data = {} }) => Nunjucks.renderString(template, data);
};

module.exports = preprocessor;
