const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/chunk-[id].[contenthash:8].js',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      // not set js.filename option, must be used the output.filename
    }),
  ],

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
