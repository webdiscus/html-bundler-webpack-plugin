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

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/home.html',
        news: './src/news.html',
      },

      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
        //filename: 'assets/js/[name].js',
      },

      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },

      //verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|scss)/,
        //use: ['css-loader', 'sass-loader'],
        use: ['css-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
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
