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
      loaderOptions: {
        sources: [
          // enable resolving in non-standard attribute
          {
            tag: 'a',
            attributes: ['data-image'],
            filter: (props) => {
              //console.log('## FILTER: ', props);
            },
          },
          // enable resolving `background-image:url(./image.png)` in the `style` attribute of the `div` tag
          {
            tag: 'div',
            attributes: ['style'],
            filter: (props) => {
              //console.log('## FILTER: ', props);
            },
          },
          //
          {
            tag: 'img',
            filter: (props) => {
              //console.log('## FILTER: ', props);
            },
          },
        ],
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|jpe?g|webp|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
