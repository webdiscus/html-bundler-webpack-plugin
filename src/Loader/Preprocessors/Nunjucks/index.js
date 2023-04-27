const { loadModule } = require('../../../Common/FileUtils');

const preprocessor = ({ watch, rootContext, options = {} }) => {
  const Nunjucks = loadModule('nunjucks');
  const templatesPath = options.views || rootContext;

  if (watch === true) {
    // enable to watch changes in serve/watch mode
    options.noCache = true;
    // disable the Nunjucks watch, because we use Webpack watch
    options.watch = false;
  }

  if (options.jinjaCompatibility === true) {
    // installs experimental support for more consistent Jinja compatibility
    // see https://mozilla.github.io/nunjucks/api.html#installjinjacompat
    Nunjucks.installJinjaCompat();
  }

  // see the options https://mozilla.github.io/nunjucks/api.html#configure
  Nunjucks.configure(templatesPath, options);

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
