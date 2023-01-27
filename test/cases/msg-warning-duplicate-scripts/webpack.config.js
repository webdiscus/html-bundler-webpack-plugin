const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        filename: 'js/[name].js',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
      },
    ],
  },
};
