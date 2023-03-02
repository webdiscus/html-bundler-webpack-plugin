const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const Mustache = require('mustache');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|mustache)$/,
      entry: {
        index: {
          import: './src/home.mustache',
          data: {
            title: 'Home',
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      loaderOptions: {
        preprocessor: (content, { data }) => Mustache.render(content, data),
      },
    }),
  ],

  module: {
    rules: [
      // {
      //   test: /\.(html|mustache)$/,
      //   loader: HtmlBundlerPlugin.loader,
      //   options: {
      //     preprocessor: (content, { data }) => Mustache.render(content, data),
      //   },
      // },
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
