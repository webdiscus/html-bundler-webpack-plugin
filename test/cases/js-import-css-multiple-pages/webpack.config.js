const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // test: import the same style in many pages
        index: './src/views/home/index.html',
        'news/sport': './src/views/news/index.html',
      },
      css: {
        filename: 'css/[name].bundle.css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
