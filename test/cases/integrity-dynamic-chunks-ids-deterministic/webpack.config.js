const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'web',

  output: {
    path: path.join(__dirname, 'dist/'),
    crossOriginLoading: 'anonymous', // required for test Subresource Integrity
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[name].[contenthash:8].chunk.js', // dynamic imported files
      },

      integrity: 'auto',
    }),
  ],

  optimization: {
    moduleIds: 'deterministic',
    realContentHash: true,
    chunkIds: 'deterministic',
    runtimeChunk: 'single',
  },
};
