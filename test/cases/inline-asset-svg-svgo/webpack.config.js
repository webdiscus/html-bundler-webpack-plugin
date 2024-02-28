const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [new HtmlBundlerPlugin()],

  module: {
    rules: [
      // inline svg, with query `?inline`
      {
        test: /\.(svg)$/i,
        resourceQuery: /inline/,
        type: 'asset/inline',
        // test of processing via svgo-loader
        // warning by `npm i svgo-loader`:
        // npm WARN deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort, so this library is deprecated
        loader: 'svgo-loader',
      },
    ],
  },
};
