const path = require('path');
const HtmlBundlerPlugin = require('../../../');

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
        index: './src/views/index.html',
        'pages/about': './src/views/about.html',
      },
      js: {
        filename: '[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },

      // images
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        // auto inline by image size
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1024,
          },
        },
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
