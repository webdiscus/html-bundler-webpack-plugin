const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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
        index: './src/index.html',
      },
      loaderOptions: {
        preprocessor: 'eta',
        preprocessorOptions: {
          autoEscape: true,
          async: true,
          varName: '__myVar__', // test: override the default `it` in template function
        },
        // test: pass external variables into js template
        data: {
          title: 'My Title',
        },
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
