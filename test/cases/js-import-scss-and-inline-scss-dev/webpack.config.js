const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
   // test importing SCSS in JS in dev mode (in prod mode is OK) when in the same file is another SCSS file inlined via `?inline` query, #102
  mode: 'development',

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
