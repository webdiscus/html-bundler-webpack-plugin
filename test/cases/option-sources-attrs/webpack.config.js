const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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
        index: './src/index.html',
      },
      sources: [
        // add filter to default tag
        {
          tag: 'img',
          attributes: ['data-src', 'data-srcset', 'data-resolve-src'],
        },
        {
          tag: 'img-ng',
          attributes: ['data-src-one', 'data-src-two'],
        },
        {
          tag: 'link',
          attributes: ['data-source'],
        },

        // image in SVG
        // {
        //   tag: 'image',
        //   attributes: ['href'],
        // },
        // // SVG image fragment
        // {
        //   tag: 'use',
        //   attributes: ['href'], // note: 'xlink:href' is deprecated and not supported in browsers, but a graphics editor
        // },
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
