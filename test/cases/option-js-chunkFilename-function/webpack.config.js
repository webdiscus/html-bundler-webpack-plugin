const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        outputPath: 'custom-path',
        filename: (pathData) => {
          return 'js/[name].[contenthash:8].js';
        },
        chunkFilename: (pathData) => {
          return 'js/chunk-[id].[contenthash:8].js';
        },
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      //chunks: 'all', // don't use it here
      minSize: 100,
      maxSize: 500,
      cacheGroups: {
        app: {
          test: /\.(js|ts)$/,
          chunks: 'all', // <- use it only here
        },
      },
    },
  },
};
