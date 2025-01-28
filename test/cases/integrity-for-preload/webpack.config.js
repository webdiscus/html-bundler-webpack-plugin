const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  //mode: 'development',
  mode: 'production',
  target: 'web',

  output: {
    crossOriginLoading: 'use-credentials',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: 'js/[name].bundle.js',
        chunkFilename: 'js/[name].chunk.js',
      },

      css: {
        filename: 'css/[name].bundle.css',
      },

      preload: [
        {
          test: /\.(js|ts)$/,
          as: 'script',
        },
        {
          test: /\.(css|scss|less)$/,
          as: 'style',
        },
        {
          test: /\.(png|jpe?g|webp|svg)$/,
          as: 'image',
        },
      ],

      integrity: true,

      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  // optimization: {
  //   runtimeChunk: {
  //     name: 'runtime', // test: preload chunks
  //   },
  // },
};
