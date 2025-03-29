const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

// test Webpack behaviour:
// module.exports = {
//   mode: 'production',
//
//   output: {
//     path: path.join(__dirname, 'dist/'),
//
//     // test: filename as function
//     filename: () => 'js/[name].[contenthash:8].js',
//     //filename: 'js/[name].[contenthash:8].js',
//
//     // test: chunkFilename must be the same filename, when filename is defined but not chunkFilename
//     chunkFilename: undefined,
//   },
//
//   entry: {
//     main: './src/main.js',
//   },
//
//   optimization: {
//     runtimeChunk: 'single',
//     splitChunks: {
//       minSize: 100,
//       maxSize: 500,
//       cacheGroups: {
//         app: {
//           test: /\.(js|ts)$/,
//           chunks: 'all',
//         },
//       },
//     },
//   },
// };

// the plugin should have the same behaviour as Webpack
module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),

    // test: filename as function
    //filename: () => 'js/[name].[contenthash:8].js',

    // test: chunkFilename must be the same filename, when filename is defined but not chunkFilename
    //chunkFilename: undefined,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      // test: filename as function and chunkFilename is undefined (not set), then chunkFilename should be default '[id].js'
      js: {
        filename: () => 'js/[name].[contenthash:8].js',
        chunkFilename: undefined,
      },
    }),
  ],

  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      minSize: 100,
      maxSize: 500,
      cacheGroups: {
        app: {
          test: /\.(js|ts)$/,
          chunks: 'all',
        },
      },
    },
  },
};
