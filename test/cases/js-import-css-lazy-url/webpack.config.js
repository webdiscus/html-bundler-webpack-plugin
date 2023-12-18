const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      css: {
        filename: '[name].[contenthash:8].css',
      },
      // test disable - OK
      preprocessor: false,
      // test output of lazy loaded CSS file
      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[hash:8][ext]',
        },
      },
    ],
  },
};
