const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html?query', // test: resolve `hot-update.js` in the output html, if used a query w/o value
      },
      hotUpdate: true, // test: when a entrypoint containing a query w/o value
    }),
  ],
};
