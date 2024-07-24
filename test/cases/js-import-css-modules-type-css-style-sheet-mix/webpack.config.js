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
        index: './src/index.html',
      },
      js: {
        filename: '[name].[contenthash:8].js',
      },
      css: {
        filename: '[name].[contenthash:8].css',
      },
      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        oneOf: [
          // extract CSS as the CSSStyleSheet object to apply it to the browser document at runtime in JS
          {
            resourceQuery: /sheet/, // style.css?sheet
            use: [
              {
                loader: 'css-loader',
                options: {
                  esModule: true, // must be enabled for using CSS module and `css-style-sheet`
                  // https://github.com/webpack-contrib/css-loader?#exporttype
                  exportType: 'css-style-sheet',
                },
              },
            ],
          },
          // extract CSS as string to inline into HTML or save into separate file
          {
            use: [
              {
                loader: 'css-loader',
                options: {
                  //exportType: 'array', // default type
                },
              },
            ],
          },
        ],
      },
    ],
  },
};
