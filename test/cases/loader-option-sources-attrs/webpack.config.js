const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
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
            {
              tag: 'image',
              attributes: ['href'],
            },
            // SVG image fragment
            {
              tag: 'use',
              attributes: ['href'], // note: 'xlink:href' is deprecated and not supported in browsers
            },
          ],
        },
      },
      {
        test: /\.(png|jpe?g|ico|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
