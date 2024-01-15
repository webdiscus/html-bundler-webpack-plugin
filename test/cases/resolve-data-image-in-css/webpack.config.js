const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './index.html',
      },
      css: {
        filename: '[name].bundle.css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(s?css)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
