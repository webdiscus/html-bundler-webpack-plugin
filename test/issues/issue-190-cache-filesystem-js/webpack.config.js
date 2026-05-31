const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: false,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/index.html',
          filename: () => '[name].html',
        },
      },

      js: {
        filename: () => '[name].[contenthash:8].js',
      },
    }),
  ],

  cache: {
    type: 'filesystem',
    cacheDirectory: path.join(__dirname, '.cache'),
  },
};
