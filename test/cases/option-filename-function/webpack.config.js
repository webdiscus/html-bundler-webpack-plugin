const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    home: './src/home.html',
    about: './src/about.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      filename: (pathData) => {
        return pathData.chunk.name === 'home' ? 'index.html' : '[name].html';
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
      },
    ],
  },
};