const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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
        index: {
          import: 'src/views/pages/home.hbs', // => dist/index.html
          // pass data to template as an object
          data: {
            title: 'Tempura',
            persons: [
              { name: 'Nils', age: 20 },
              { name: 'Robert', age: 10 },
              { name: 'Margaret', age: 40 },
            ],
          },
        },
      },
      // specify the `tempura` template engine
      preprocessor: 'tempura',
      // define tempura options
      preprocessorOptions: {
        views: ['src/views/partials'],
        blocks: {
          // define custom helpers
          bar: ({ value }) => `<bar>${value}</bar>`,
        },
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
        test: /\.(scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
