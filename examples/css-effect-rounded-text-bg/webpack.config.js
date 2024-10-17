const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  //mode: 'd',

  output: {
    path: path.resolve(__dirname, 'dist'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: 'src/index.html',
      },
      js: {
        // output filename of compiled JavaScript
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(s?css)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jp?g|webp|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  // enable live reload
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
