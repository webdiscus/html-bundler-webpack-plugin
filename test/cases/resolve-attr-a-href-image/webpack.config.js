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
          {
            tag: 'a',
            attributes: ['href'],
            filter: ({ value }) => !value.endsWith('.html'),
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
