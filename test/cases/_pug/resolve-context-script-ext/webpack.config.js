const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      // test: usage alias as relative by root context path
      ScriptsContext: '/src/assets/scripts/',
      // test: usage alias as absolute path
      Scripts: path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {
        // TODO: fix - if the context is defined and basedir is undefined, then set basedir from context
        basedir: __dirname,
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
    }),
  ],
};
