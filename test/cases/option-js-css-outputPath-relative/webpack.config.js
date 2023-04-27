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
        index: './src/views/home/index.html',
      },
      js: {
        filename: '[name].bundle.js',
        // test the path relative by output.path
        outputPath: 'assets/js/',
      },
      css: {
        filename: '[name].bundle.css',
        // test the path relative by output.path
        outputPath: 'assets/css/',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/i,
        type: 'javascript/auto',
        generator: {
          outputPath: 'cdn-assets/',
        },
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
