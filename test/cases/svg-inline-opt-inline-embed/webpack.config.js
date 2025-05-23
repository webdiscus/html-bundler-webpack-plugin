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
        inline: {
          // equivalent to:
          // - generator.dataUrl.encoding = false
          // - ?inline=escape
          encoding: false, // escaped URL

          // equivalent to query: ?inline=embed or ?embed
          // will be applied only in HTML by replacing <img> tag with <svg>
          embed: true,
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
        test: /\.(png)/i,
        type: 'asset/inline',
      },

      {
        test: /\.(svg)/i,
        type: 'asset/inline',
      },
    ],
  },
};
