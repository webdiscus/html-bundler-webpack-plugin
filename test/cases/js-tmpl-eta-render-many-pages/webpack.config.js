const path = require('path');
const HtmlBundlerPlugin = require('../../../');

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
      entry: {
        page1: {
          import: './src/template.html',
          // pass data into the entry template
          // NOTE: the data are NOT available in the imported template in JS
          data: {
            title: 'Page 1',
          },
        },
        page2: {
          import: './src/template.html',
          // pass data into the entry template
          // NOTE: the data are NOT available in the imported template in JS
          data: {
            title: 'Page 2',
          },
        },
      },

      // global data passed into all templates, including imported templates in JS
      data: {
        buttonText: 'My button',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(ico|png|jp?g|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
