const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

import myHelpers from './src/helpers/my-helpers.js';

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.hbs',
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        strict: true,
        helpers: myHelpers,
        partials: ['src/partials'],
      },
      data: {
        title: 'Test',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(ico|png|jpe?g|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
