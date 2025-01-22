const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  name: 'issue143',
  mode: 'production',
  cache: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  // entry: {
  //   script: {
  //     import: './src/main.js',
  //     filename: (pathData, assetInfo) => {
  //       console.log(' ############## ', { assetInfo }, pathData);
  //       return '[name].js';
  //     },
  //   },
  // },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/home.html',
        about: './src/about.html',
      },
      js: {
        //filename: '[name].[contenthash:8].js',
        //filename: '[name].js',
        filename: (pathData, assetInfo) => {
          //console.log(' ===> ', { assetInfo }, pathData);
          return '[name].[contenthash:8].js';
        },
      },
    }),
  ],
};
