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
      },

      js: {
        filename: 'js/[name].[contenthash:8].js',
        //filename: 'js/[name].js',
      },

      css: {
        filename: 'css/[name].[contenthash:8].css',
      },

      //verbose: true,
      hotUpdate: false, // test to disable auto-injection of hot-update.js files
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(s?css)/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  devServer: {
    //hot: false,
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
