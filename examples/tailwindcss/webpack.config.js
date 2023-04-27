const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  //stats: 'normal',
  stats: 'errors-warnings',

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/home.html',
        news: './src/news.html',
      },

      js: {
        filename: 'js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'css/[name].[contenthash:8].css',
      },

      //verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|scss)/,
        use: ['css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },

  // enable HMR with live reload
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
