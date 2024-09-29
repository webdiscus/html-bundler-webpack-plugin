const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const Handlebars = require('handlebars');

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
        index: 'src/views/pages/home.hbs',
      },

      preprocessor: 'handlebars',
      preprocessorOptions: {
        // define helpers manually
        helpers: {
          bold: (options) => new Handlebars.SafeString(`<strong>${options.fn(this)}</strong>`),
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
