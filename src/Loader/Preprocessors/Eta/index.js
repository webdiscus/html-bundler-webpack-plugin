const path = require('path');
const { loadModule } = require('../../../Common/FileUtils');

const preprocessor = (loaderContext, options) => {
  const Eta = loadModule('eta', () => require('eta').Eta);
  const { rootContext } = loaderContext;
  let views = options.views;

  if (!views) {
    views = rootContext;
  } else if (!path.isAbsolute(views)) {
    views = path.join(rootContext, views);
  }

  const eta = new Eta({
    useWith: true, // allow using variables in template without `it.` scope
    ...options,
    views, // directory that contains templates
  });

  // since eta v3 the `async` option is removed, but for compatibility, it is still used in this plugin
  // defaults is false, wenn is true then must be used `await includeAsync()`
  const async = options?.async === true;

  return async
    ? (template, { data = {} }) => eta.renderStringAsync(template, data)
    : (template, { data = {} }) => eta.renderString(template, data);
};

module.exports = preprocessor;
