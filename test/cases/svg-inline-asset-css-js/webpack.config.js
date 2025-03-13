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
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css)$/,
        loader: 'css-loader',
      },
      {
        oneOf: [
          {
            test: /\.svg/i,
            resourceQuery: /raw/,
            type: 'asset/source',
          },
          {
            test: /\.svg/i,
            type: 'asset',
            parser: {
              dataUrlCondition(source, { filename }) {
                //console.log('dataUrlCondition: ', filename);
                return Buffer.byteLength(source) <= 1024;
              },
            },
            generator: {
              filename: '[name].[contenthash:8][ext]',
              // dataUrl: {
              //   encoding: false,
              // },
              dataUrl: (source, { filename }) => {
                let svg = source.toString().replace('viewBox', 'class="processed-data-url" viewBox');
                //console.log('dataUrl: ', filename);
                return svgToMiniDataURI(svg);
              },
            },
          },
        ],
      },
    ],
  },
};
