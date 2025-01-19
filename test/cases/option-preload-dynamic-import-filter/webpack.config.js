const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
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
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
        chunkFilename: 'js/[name].chunk.js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },

      preload: [
        {
          test: /\.(js|ts)$/,
          filter: {
            excludes: [/no\-preload/, /asyncChunk/],
          },
          // the same effect using the function
          // filter: (assetFile) => {
          //   console.log(' >> FILTER: ', assetFile);
          //   return !/no\-preload|asyncChunk/.test(assetFile);
          // },
          as: 'script',
        },
        {
          test: /\.(s?css|less)$/,
          as: 'style',
          filter: {
            excludes: [/module2/],
          },
        },
        {
          test: /\.(eot|ttf|woff2?)$/,
          as: 'font',
        },
      ],
      verbose: true,
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
