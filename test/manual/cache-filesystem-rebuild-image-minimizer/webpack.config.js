const path = require('path');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist'),
    clean: true,
  },
  entry: {
    //main: './src/main.js', // test here or in bundler plugin entry
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|webp|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
    }),
  ],
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        test: /\.(png|jpe?g|webp|svg)$/i,
        deleteOriginalAssets: false,
        minimizer: {
          implementation: ImageMinimizerPlugin.svgoMinify,
        },
      }),
    ],
  },
  cache: {
    type: 'filesystem', // <= issue only with cache filesystem
    cacheDirectory: path.join(__dirname, '.cache'),
  },
};
