const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  //mode: 'production', // 1. test in production mode
  mode: 'development', // 2. test in development mode
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist/'),
    filename: '[name].[contenthash].js',
    crossOriginLoading: 'anonymous',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      integrity: true, // test integrity in serv mode after adding new import JS in main.js
      verbose: true,
    }),
  ],

  optimization: {
    runtimeChunk: {
      // add webpack runtime code as a file into html
      name: 'runtime',
    },
  },

  // enable live reload
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
