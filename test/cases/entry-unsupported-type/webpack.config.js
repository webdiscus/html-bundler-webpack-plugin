const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|txt)$/,
      entry: {
        index: './src/index.html',
        info: './src/info.txt',
        main: './src/main.js',
      },
    }),
  ],

  module: {
    rules: [
      // {
      //   test: /\.(txt)$/i,
      //   type: 'asset/resource',
      //   generator: {
      //     filename: '[name][ext]',
      //   },
      // },
    ],
  },
};
