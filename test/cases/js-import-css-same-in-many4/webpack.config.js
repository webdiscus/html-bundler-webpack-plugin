const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/home.html',
        news: './src/news.html',
      },

      js: {
        filename: 'js/[name].bundle.js',
      },

      css: {
        filename: 'css/[name].bundle.css',
      },

      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)/,
        use: ['css-loader'],
      },
    ],
  },
};
