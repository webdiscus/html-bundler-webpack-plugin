const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const helpers = {
  object: (options) => options.hash || {},
  array: (...args) => args.slice(0, -1),
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.hbs',
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        strict: true, // test the option in the precompiled template function
        partials: ['src/partials'],
        helpers,
      },
      data: {
        title: 'My Title',
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
