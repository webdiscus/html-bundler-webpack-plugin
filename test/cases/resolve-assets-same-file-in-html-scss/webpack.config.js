const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    alias: {
      '@images': path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/views/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        filename: '[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(s?css)$/,
        use: ['css-loader', 'sass-loader'],
      },

      {
        test: /\.(webp|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
