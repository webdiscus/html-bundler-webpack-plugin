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
        index: './src/views/index.html',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /[\\/]images[\\/].+(png|jpe?g|svg|webp|ico)$/i,
        oneOf: [
          // inline image using `?inline` query
          {
            resourceQuery: /inline/,
            type: 'asset/inline',
          },
          // save to file
          {
            type: 'asset/resource',
            generator: {
              filename: 'assets/img/[name].[hash:8][ext]',
            },
          },
        ],
      },
    ],
  },
};
