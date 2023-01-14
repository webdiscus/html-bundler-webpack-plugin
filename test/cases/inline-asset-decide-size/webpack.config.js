const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/index.html',
    about: './src/views/about.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      //verbose: true,
      js: {
        filename: '[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
      },

      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      // images
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      // inline images: png or svg icons with size < 2 KB
      {
        test: /\.(png|svg)$/i,
        type: 'asset',
        exclude: /favicon/, // don't inline favicon
        parser: {
          dataUrlCondition: {
            maxSize: 2048, // 2kb
          },
        },
      },
    ],
  },
};