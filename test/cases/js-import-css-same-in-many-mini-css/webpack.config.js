const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    home: './src/home.js',
    news: './src/news.js',
  },

  plugins: [new MiniCssExtractPlugin()],

  module: {
    rules: [
      {
        test: /\.(css)/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
};
