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

      js: {
        filename: '[name].[contenthash:8].js',
      },

      css: {
        filename: '[name].[contenthash:8].css',
      },

      svg: {
        // defaults behaviour by inline svg using `asset/inline` with disabled plugin svg options
        enabled: false,

        // apply options to resource matched by filename
        //test: /\.svg/i,

        //inline: true,
        //inline: false,

        inline: {
          // equivalent to query: ?inline=embed or ?embed
          //embed: true, // enable inline SVG by replacing <img> with <svg>, only for HTML
          // data URL encoding
          // equivalent to query: ?inline=base64
          //encoding: 'base64', // inline as a base64-encoded data URL, e.g.: `data:image/svg+xml;base64,PHN2y...`
          // equivalent to query: ?inline=escape
          //encoding: false, // inline as a URL-encoded data URL, e.g.: `data:image/svg+xml,%3Csvg%20xmlns%3D%22...`
        },
      },

      //verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        loader: 'css-loader',
      },

      {
        test: /\.(svg|png)/i,
        type: 'asset/inline',
      },
    ],
  },
};
