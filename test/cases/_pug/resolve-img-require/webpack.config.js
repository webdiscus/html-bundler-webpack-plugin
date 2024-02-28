const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/index.pug',
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
        test: /\.(png|jpg|jpeg|ico)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
