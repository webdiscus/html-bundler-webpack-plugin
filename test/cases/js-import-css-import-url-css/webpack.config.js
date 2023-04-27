const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      verbose: true, // test resolving css file in scss file
      entry: {
        index: './src/index.html',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/i,
        use: [
          {
            loader: 'css-loader',
            options: {
              // Note: imported CSS files must be manually copied to dist folder using the copy-webpack-plugin
              import: false, // disable @import at-rules handling
            },
          },
        ],
      },
    ],
  },
};
