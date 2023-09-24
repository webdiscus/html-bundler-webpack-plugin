const purgeCss = require('./purgeCss.plugin.js');

/** @type {import('postcss-load-config').Config} */
const config = {
  map: false,
  plugins: {
    ...purgeCss,
  },
};

module.exports = config;
