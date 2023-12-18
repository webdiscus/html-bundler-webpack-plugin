const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /\.(js|ts)$/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      extractComments: false, // disable extracting license into separate file *.LICENSE.txt
    }),
  ],
};
