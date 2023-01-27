const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      // test: modules must be the array of ModuleOptions, also not any object
      modules: {},
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html/,
        loader: HtmlBundlerPlugin.loader,
      },
    ],
  },
};
