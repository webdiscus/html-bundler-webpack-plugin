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
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        //enabled: false, // must be false if used the `exportType: 'css-style-sheet'`
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              esModule: true, // must be enabled for using CSS module and `css-style-sheet`
              // https://github.com/webpack-contrib/css-loader?#exporttype
              exportType: 'css-style-sheet',
              // see https://github.com/webpack-contrib/css-loader#modules
              // modules: {
              //   localIdentName: '[name]__[local]--[hash:base64:5]',
              //   exportLocalsConvention: 'camelCase',
              // },
            },
          },
        ],
      },
    ],
  },
};