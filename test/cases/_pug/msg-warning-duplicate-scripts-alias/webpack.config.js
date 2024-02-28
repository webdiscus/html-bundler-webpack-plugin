const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  resolve: {
    alias: {
      Scripts: path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  entry: {
    index: './src/views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {},
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
    }),
  ],


};
