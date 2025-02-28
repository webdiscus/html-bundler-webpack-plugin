const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');

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
        generator: {
          dataUrl: (content, { filename }) => {
            if (typeof content !== 'string') {
              content = content.toString();
            }

            // test: modify original source, generated SVG must contains `class='my-svg'`
            content = content.replace('viewBox', `class='my-svg' viewBox`);

            return svgToMiniDataURI(content);
          },
        },
      },
    ],
  },
};
