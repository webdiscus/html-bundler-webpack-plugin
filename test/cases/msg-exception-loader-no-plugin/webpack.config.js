const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: './src/index.html',

  // test to use the loader without the HtmlBundlerPlugin
  //plugins: [new HtmlBundlerPlugin()],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
      },
    ],
  },
};
