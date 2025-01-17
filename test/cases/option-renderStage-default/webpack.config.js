const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const Compilation = require('webpack/lib/Compilation');

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
    new CompressionPlugin(),
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/index.html',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
      minify: true,
      // test default value of the renderStage option
      //renderStage: Infinity + 1, // should throw an error
      //renderStage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE, // the value is too low, it will be set as PROCESS_ASSETS_STAGE_SUMMARIZE, pass OK
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(ico|png|jpe?g|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
