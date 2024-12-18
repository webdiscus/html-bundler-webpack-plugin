const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    'lib-css': './src/lib/lib.css', // test: change the css file when no html entry defined
    'lib-js': './src/lib/lib.js',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        //index: './src/home.html', // test: change css file when no html entry
      },
      js: {
        filename: '[name].js',
      },
      css: {
        filename: '[name].css',
      },
      preprocessor: false,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)/,
        use: ['css-loader'],
      },
    ],
  },

  devServer: {
    static: path.join(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
