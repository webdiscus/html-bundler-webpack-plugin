const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/home.html',
        about: './src/about.html',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
        inline: {
          chunk: [/runtime.+[.]js/],
        },
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },

  optimization: {
    splitChunks: {
      minSize: 100, // force split
      cacheGroups: {
        default: {
          //test: /.+\.(js|ts)$/, // <= solution: split only scripts, excluding style files
          name: 'common',
          chunks: 'all',
          minChunks: 2,
        },
      },
    },
  },
};
