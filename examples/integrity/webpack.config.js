const path = require('path');
//const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const HtmlBundlerPlugin = require('../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.resolve(__dirname, 'dist'),
    crossOriginLoading: 'anonymous', // required for Subresource Integrity
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: 'src/index.html',
      },
      js: {
        // output filename of compiled JavaScript
        filename: 'js/[name].[contenthash:8].js',
        // output filename of dynamic imported chunks
        chunkFilename: 'js/[name].[contenthash:8].chunk.js',
      },
      css: {
        // output filename of extracted CSS
        filename: 'css/[name].[contenthash:8].css',
      },
      integrity: 'auto', // include integrity in production mode only
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jp?g|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
