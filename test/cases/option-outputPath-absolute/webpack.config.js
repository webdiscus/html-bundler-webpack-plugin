const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      outputPath: path.join(__dirname, 'dist/example'),
      entry: {
        index: './src/index.html',
      },
      js: {
        // test: relative outputPath
        filename: '[name].bundle.js',
        outputPath: 'assets/js/',
      },
      css: {
        // test: relative outputPath
        filename: '[name].bundle.css',
        outputPath: 'assets/css/',
      },
      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ],
  },
};
