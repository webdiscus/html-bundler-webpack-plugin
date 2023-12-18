const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      // verbose: true,
      entry: {
        home: 'src/home.html',
        news: 'src/news.html',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
    }),
  ],
};
