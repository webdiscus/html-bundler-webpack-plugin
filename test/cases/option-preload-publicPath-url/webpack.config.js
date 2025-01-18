const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: 'https://example.site/static/',
  },

  resolve: {
    alias: {
      '@src': path.join(__dirname, 'src'),
      '@fonts': path.join(__dirname, '../../fixtures/fonts'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        'home/index': './src/views/index.html',
        about: {
          import: './src/views/index.html',
          filename: 'news/sport/index.html',
        },
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },

      preload: [
        {
          test: /\.(js|ts)$/,
          as: 'script',
        },
        {
          test: /\.(s?css|less)$/,
          as: 'style',
        },
        {
          test: /\.(eot|ttf|woff2?)$/,
          as: 'font',
        },
      ],
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /\.(ico|png|jpe?g|svg)/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
      {
        test: /\.(eot|ttf|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
    ],
  },
};
