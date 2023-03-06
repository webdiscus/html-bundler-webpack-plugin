const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    //chunkFilename: 'assets/js/[id].js',
  },

  resolve: {
    alias: {
      Fonts: path.join(__dirname, 'src/assets/fonts'),
      Images: path.join(__dirname, 'src/assets/img'),
      Styles: path.join(__dirname, 'src/assets/styles'),
      Scripts: path.join(__dirname, 'src/assets/js'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: 'src/views/index.html',
        about: 'src/views/about.html',
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
      },
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
        //chunks: 'all', // DON'T use default splitting, it's break compilation process in the plugin
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
