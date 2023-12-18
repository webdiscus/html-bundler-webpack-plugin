const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    filename: 'js-override/[name].[contenthash:8].js',
  },

  resolve: {
    alias: {
      '@scripts': path.join(__dirname, 'src/js/'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html?lang=en',
        'de/index': './src/index.html?lang=de',
      },
      js: {
        // this option must override the output.filename
        filename: 'js/[name].[contenthash:8].js',
      },
    }),
  ],
};
