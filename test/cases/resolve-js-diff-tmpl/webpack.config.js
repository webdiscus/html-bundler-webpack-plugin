const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/home.html',
    news: './src/news.html',
    about: './src/about.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
    }),
  ],
};
