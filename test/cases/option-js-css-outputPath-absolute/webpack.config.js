const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/home/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        // test verbose for JS
        verbose: true,
        //filename: '[name].[contenthash:8].js',
        // test filename as function
        filename: (pathData) => {
          return '[name].[contenthash:8].js';
        },
        // test the absolute path
        outputPath: path.join(__dirname, 'dist/assets/js/'),
      },
      css: {
        //filename: '[name].[contenthash:8].css',
        // test filename as function
        filename: (pathData) => {
          return '[name].[contenthash:8].css';
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
        test: /\.html/,
        loader: HtmlBundlerPlugin.loader,
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
