const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/home/index.html',
      },
      js: {
        // test verbose for JS
        verbose: true,
        //filename: '[name].[contenthash:8].js',
        // test filename as function
        filename: (pathData) => {
          return '[name].bundle.js';
        },
        // test the absolute path
        outputPath: path.join(__dirname, 'dist/assets/js/'),
      },
      css: {
        //filename: '[name].[contenthash:8].css',
        // test filename as function
        filename: (pathData) => {
          return '[name].bundle.css';
        },
        // test the absolute path
        outputPath: path.join(__dirname, 'dist/assets/css/'),
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/i,
        type: 'javascript/auto',
        generator: {
          outputPath: 'cdn-assets/',
        },
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
