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
        test: /\.(svg)/i,
        type: 'asset/inline',
        generator: {
          dataUrl: (source, { filename }) => {
            let svg = svgToMiniDataURI(source.toString());
            //console.log('--dataUrl: ', filename, '\n');

            return svg;
          },
        },
      },
    ],
  },
};
