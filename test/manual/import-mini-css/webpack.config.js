const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    main: './src/main.js',
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
      '@styles': path.join(__dirname, 'src/styles'),
    },
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|scss)/,
        //use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
