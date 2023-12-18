const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    //index: ['./src/main.js'], // OK
    //index: ['./src/styles.css'], // OK
    //index: ['./src/main.js', './src/styles.css'], // TODO: fix
    //index: ['./src/styles.css', './src/main.js'], // TODO: fix
  },

  plugins: [
    // new HtmlBundlerPlugin({
    //   js: {
    //     filename: '[name].[contenthash:8].js',
    //   },
    //   css: {
    //     filename: '[name].[contenthash:8].css',
    //   },
    // }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)/,
        use: ['css-loader'],
      },
    ],
  },
};
