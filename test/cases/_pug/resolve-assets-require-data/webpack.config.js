const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      Images: path.join(__dirname, './src/images/'),
    },
  },

  entry: {
    index: './src/views/home.pug',
    about: './src/views/about.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      js: {
        filename: '[name].[contenthash:8].js',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
