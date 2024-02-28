const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    // test auto path
    publicPath: 'auto',
  },

  // test same entry key 'index' for html and js files => index.1.js, index.2.js, but must be index.js
  entry: {
    // test relative CSS paths when used one style in one template file which is generated with different output paths
    index: './src/index.html?lang=en',
    'de/index': './src/index.html?lang=de',
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        filename: '[name].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        loader: 'css-loader',
      },
    ],
  },
};
