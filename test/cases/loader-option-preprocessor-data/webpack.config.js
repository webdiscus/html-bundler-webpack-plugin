const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/home.html',
          // page specifically data
          data: {
            title: 'Home', // override the `title` defined in loader data
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
        about: './src/about.html',
      },
      loaderOptions: {
        // global data for all pages
        data: {
          title: 'Default Title for all pages', // must be overridden with page title
          globalData: 'Data passed into all pages.', // must be passed into all pages
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
