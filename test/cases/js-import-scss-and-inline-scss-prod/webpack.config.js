const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
    publicPath: '',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      verbose: true,
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
