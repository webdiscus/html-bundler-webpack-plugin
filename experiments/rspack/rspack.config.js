const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '',
  },

  entry: {},

  plugins: [
    // this plugin works fine
    // new HtmlWebpackPlugin({
    //   template: './src/template.html',
    // }),

    // TODO: fix rspack issue
    new HtmlBundlerPlugin({
      entry: {
        index: './src/template.html',
      },
    }),
  ],
};
