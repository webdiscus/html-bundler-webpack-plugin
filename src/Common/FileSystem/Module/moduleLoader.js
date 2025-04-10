const { pathToFileURL } = require('url');

const esmLoader = (absolutePath) => {
  const fileUrl = pathToFileURL(absolutePath).href;

  // Note: read real data after changes from root file, sub-imported files are still cached.
  return import(`${fileUrl}?nocache=${Date.now()}`);
};

module.exports = esmLoader;
