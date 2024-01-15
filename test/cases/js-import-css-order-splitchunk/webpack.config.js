const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].chunk.js',
      },

      css: {
        filename: '[name].bundle.css',
        chunkFilename: '[name].chunk.css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
    ],
  },

  optimization: {
    // TODO: implement split css chunks.
    //  - It is really very important?
    //  - Does anyone need it?
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // test: should be generated separate css chunk, e.g., 616.css
        style1: {
          test: /style1/,
          enforce: true,
        },
        // test: should be generated separate css chunk, e.g., 714.css
        style2: {
          test: /style2/,
          enforce: true,
        },
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
