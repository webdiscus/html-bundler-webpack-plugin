const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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
        // test: filename as function and relative outputPath
        filename: () => '[name].bundle.js',
        outputPath: 'assets/js/',
      },
      css: {
        // test: filename as function and relative outputPath
        filename: () => '[name].bundle.css',
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
