const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const ejs = require('ejs');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|ejs)$/,
      entry: {
        index: {
          import: './src/home.ejs',
          data: {
            title: 'Home',
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      loaderOptions: {
        // return promise
        preprocessor: (content, { rootContext: root, data }) => ejs.render(content, data, { root, async: true }),
      },
    }),
  ],

  module: {
    rules: [
      // the same options as in loaderOptions
      // {
      //   test: /\.(html|ejs)$/,
      //   loader: HtmlBundlerPlugin.loader,
      //   options: {
      //     // return promise
      //     preprocessor: (content, { data }) => ejs.render(content, data, { async: true }),
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
