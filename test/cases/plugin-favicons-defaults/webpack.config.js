const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const { FaviconsBundlerPlugin } = require('../../../plugins');

module.exports = {
  mode: 'production',
  //mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        filename: '[name].bundle.js',
      },
      css: {
        filename: '[name].bundle.css',
      },
      //minify: 'auto',
    }),
    // test default options
    new FaviconsBundlerPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
