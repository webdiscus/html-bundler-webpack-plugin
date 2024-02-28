const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {},
      js: {
        filename: 'js/[name].js',
      },
    }),
  ],


};
