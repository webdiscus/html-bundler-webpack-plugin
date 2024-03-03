const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    // test: render both the HTML and Pug templates
    index: './src/index.pug',
    about: './src/about.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.pug|html$/,
      preprocessor: 'pug',
    }),
  ],
};
