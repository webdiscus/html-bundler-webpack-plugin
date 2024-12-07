const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/home.pug',
        about: './src/about.pug',
      },
      preprocessor: 'pug',
      hotUpdate: true,
      verbose: true,
    }),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
