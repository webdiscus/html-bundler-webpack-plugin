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
      },

      //verbose: true,
      //hotUpdate: false, // test to disable auto-injection of hot-update.js files
      //hotUpdate: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)/,
        use: ['css-loader'],
        //use: [HtmlBundlerPlugin.cssLoader.loader, 'css-loader'],
      },
    ],
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    //hot: false, // // default is true, enable HMR (works for CSS only)

    // disable watch to avoid live reload
    //liveReload: true, // default is true
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
