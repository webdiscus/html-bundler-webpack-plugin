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
          // test: if the `encoding` not specified here, use generator.dataUrl.encoding option
          //encoding: 'base64', // overrides generator.dataUrl.encoding option
          //encoding: false, // overrides generator.dataUrl.encoding option
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
        test: /\.(png)$/i,
        type: 'asset/inline',
      },

      {
        test: /\.(svg)$/i,
        type: 'asset/inline',
        generator: {
          dataUrl: {
            encoding: false, // escaped URL
          },
        },
      },
    ],
  },
};
