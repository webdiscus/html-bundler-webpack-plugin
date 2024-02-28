const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const srcPath = path.resolve(__dirname, 'src');

module.exports = {
  mode: 'production',
  devtool: false,

  // test: usage of context with relative aliases
  context: srcPath,
  resolve: {
    alias: {
      // test: usage relative by context path
      Scripts: '/assets/scripts/',
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    'home/index': path.join(srcPath, 'views/index.pug'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {
        // TODO: fix - if the context is defined and basedir is undefined, then set basedir from context
        basedir: srcPath,
      },
      js: {
        filename: '[name].[contenthash:8].js',
      },
    }),
  ],
};
