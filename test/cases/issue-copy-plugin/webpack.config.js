const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      // Test: issue when used copy plugin and minify, then minify try to handeln the copied HTML file too.
      // The bundler plugin should ignore the HTML files processed via other plugins.
      minify: true,
    }),

    new CopyWebpackPlugin({
      patterns: [{ from: 'src/static', to: '' }],
    }),
  ],
};
