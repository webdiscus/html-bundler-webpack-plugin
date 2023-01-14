const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'development',

  resolve: {
    alias: {
      Fonts: path.join(__dirname, 'src/assets/fonts/'),
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/views/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      //verbose: true,
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

      // fonts
      {
        test: /\.(woff2?|ttf|otf|eot|svg)$/,
        type: 'asset/resource',
        include: /assets[\\/]fonts/, // fonts from `assets/fonts` directory
        generator: {
          filename: 'assets/fonts/[name][ext][query]',
        },
      },

      // image files
      {
        test: /\.(png|svg|jpe?g|webp|ico)$/i,
        type: 'asset/resource',
        include: /assets[\\/]images/, // images from `assets/images` directory and > 2 KB
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      // inline images: png or svg icons with size < 2 KB
      {
        test: /\.(png|svg)$/i,
        type: 'asset', //-> asset/inline for images < 2 KB
        include: /assets[\\/]images/,
        parser: {
          dataUrlCondition: {
            maxSize: 2 * 1024,
          },
        },
      },
    ],
  },
};