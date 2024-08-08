const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    crossOriginLoading: 'anonymous', // required for test Subresource Integrity
  },

  // test enabled integrity option, but no template is defined, see #107
  entry: './src/main.js', // this file should exist, contents don't matter

  plugins: [
    new HtmlBundlerPlugin({
      integrity: true,
    }),
  ],
};
