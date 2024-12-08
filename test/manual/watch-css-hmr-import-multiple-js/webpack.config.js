const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/home.html',
      },

      js: {
        filename: 'js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'css/[name].[contenthash:8].css',
        hot: true,
      },

      verbose: true,
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
    static: {
      directory: path.join(__dirname, 'dist'),
    },

    // disable watch to avoid live reload
    //liveReload: false, // default is true
    watchFiles: {
      paths: ['src/**/*.(html|eta)'], // if the `hot` option is enabled then exclude *.s?css from watched files
      //paths: ['src/**/*.*'], // if the `hot` option is enabled then exclude *.s?css from watched files
      options: {
        usePolling: true,
      },
    },
  },
};
