const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const { FaviconsBundlerPlugin } = require('html-bundler-webpack-plugin/plugins');

module.exports = {
  mode: 'development',

  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: 'src/index.html',
      },
      js: {
        // output filename of JavaScript
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of CSS
        filename: 'css/[name].[contenthash:8].css',
      },
    }),

    // add the build-in favicons plugin
    new FaviconsBundlerPlugin({
      enabled: 'auto', // generate favicons in production mode only
      //enabled: true, // generate favicons in all modes
      // favicons configuration options, see https://github.com/itgalaxy/favicons#usage
      faviconOptions: {
        path: '/favicons', // favicons output path relative to webpack output.path
        icons: {
          android: true, // Create Android homescreen icon.
          appleIcon: true, // Create Apple touch icons.
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
        test: /\.(scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jp?g|svg)/,
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
