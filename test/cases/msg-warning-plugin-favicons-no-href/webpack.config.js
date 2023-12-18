const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const { FaviconsBundlerPlugin } = require('../../../plugins');

module.exports = {
  mode: 'production',
  //mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
    }),
    // test custom bundler plugin
    new FaviconsBundlerPlugin({
      enabled: 'auto', // true, false, auto - generate favicons in production mode only
      // favicons configuration options, see https://github.com/itgalaxy/favicons#usage
      faviconOptions: {
        path: '/img/favicons',
        appName: 'My App',
        icons: {
          android: false, // Create Android homescreen icon.
          appleIcon: false, // Create Apple touch icons.
          appleStartup: false, // Create Apple startup images.
          favicons: true, // Create regular favicons.
          windows: false, // Create Windows 8 tile icons.
          yandex: false, // Create Yandex browser icon.
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
