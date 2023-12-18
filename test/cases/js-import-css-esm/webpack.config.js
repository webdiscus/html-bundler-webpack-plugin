const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@fixtures': path.resolve(__dirname, '../../fixtures'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },

      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)/,
        //use: ['css-loader', 'sass-loader'], // 1.1 sec
        use: ['css-loader'], // 0.7 sec
      },
    ],
  },
};
