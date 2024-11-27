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
    }),
  ],

  optimization: {
    splitChunks: {
      chunks: 'all', // <= DO NOT use this here, it doesn't make sense because we will split only scripts in a group
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // <= IMPORTANT: split only script files
          name: 'vendor',
          chunks: 'all', // <= DEFINE `chunks: 'all'` only in a cache group
        },
        default: {
          minChunks: 2,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
  },
};
