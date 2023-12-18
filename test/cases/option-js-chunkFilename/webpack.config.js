const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
        chunkFilename: 'assets/js/chunk-[id].[contenthash:8].js',
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
