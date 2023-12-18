const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        home: './src/home.html',
        news: './src/news.html',
      },

      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
        //filename: 'assets/js/[name].js',
      },

      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },

      //verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|scss)/,
        use: ['css-loader'],
      },
    ],
  },
};
