const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {},
      loaderOptions: {
        esModule: false, // w/o esm export the compiled js is contains js additional overhead code
      },
    }),
  ],
};
