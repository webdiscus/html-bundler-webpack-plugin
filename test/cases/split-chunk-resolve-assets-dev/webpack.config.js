const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@fonts': path.join(__dirname, '../../fixtures/fonts'),
      '@images': path.join(__dirname, '../../fixtures/images'),
      '@styles': path.join(__dirname, 'src/assets/styles'),
      '@scripts': path.join(__dirname, 'src/assets/js'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.html',
        about: 'src/views/about.html',
      },
      js: {
        filename: 'assets/js/[name].bundle.js',
      },
      css: {
        filename: 'assets/css/[name].bundle.css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },

  // test split chunks
  optimization: {
    splitChunks: {
      cacheGroups: {
        //chunks: 'all', // DON'T use default splitting, it's break the compilation process in the plugin
        scripts: {
          // split scripts only, because webpack compile all assets such as css, html, into JS module
          test: /\.(js|ts)$/,
          // note: when used splitChunks.cacheGroups, then use the `filename` option,
          // because output.chunkFilename is ignored
          filename: 'assets/js/[id].[contenthash:8].js',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
};
