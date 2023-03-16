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
        index: './src/views/index.html',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
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
