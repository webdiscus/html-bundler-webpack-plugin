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
    //publicPath: '/',
  },

  plugins: [
    new HtmlBundlerPlugin({
      //verbose: true,
      entry: {
        index: './src/views/index.html',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      // fonts from 'font' directory
      {
        test: /[\\/]fonts[\\/].+(woff2?|ttf|otf|eot|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext][query]',
        },
      },

      // image files from 'images' directory
      {
        test: /[\\/]images[\\/].+(png|jpe?g|svg|webp|ico)$/i,
        oneOf: [
          // auto inline by image size < 1 KB
          {
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 1024,
              },
            },
            // image > 1 KB save to file
            generator: {
              filename: 'assets/img/[name].[hash:8][ext]',
            },
          },
        ],
      },
    ],
  },
};
