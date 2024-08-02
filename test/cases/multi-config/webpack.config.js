const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = [
  {
    name: 'first',
    target: 'web',
    mode: 'production',

    output: {
      path: path.join(__dirname, 'dist/output1'),
    },

    plugins: [
      new HtmlBundlerPlugin({
        entry: {
          index: './src/home.html',
        },
      }),
    ],
  },

  {
    name: 'second',
    target: 'web',
    mode: 'production',

    output: {
      path: path.join(__dirname, 'dist/output2'),
    },

    entry: {
      main: './src/main.js',
    },

    plugins: [
      new HtmlBundlerPlugin({
        entry: {
          about: './src/about.html',
        },
      }),
    ],
  },
];
