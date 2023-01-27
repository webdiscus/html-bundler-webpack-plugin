const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  entry: {
    index: './src/index.html',
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /\.(js|ts)/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      extractComments: true, // extract license into separate file *.LICENSE.txt
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          method: 'render',
        },
      },
    ],
  },
};
