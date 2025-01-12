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
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader'],
      },
      // Note: since v4.12 the plugin supports the `?inline` query to load assets as data URL
      {
        test: /[\\/]images[\\/].+(png|jpe?g|svg|webp|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },

      // {
      //   test: /[\\/]images[\\/].+(png|jpe?g|svg|webp|ico)$/i,
      //   oneOf: [
      //     // Note: since v4.12 is not need anymore
      //     // inline image using `?inline` query
      //     {
      //       resourceQuery: /inline/,
      //       type: 'asset/inline',
      //     },
      //     // save to file
      //     {
      //       type: 'asset/resource',
      //       generator: {
      //         filename: 'img/[name].[hash:8][ext]',
      //       },
      //     },
      //   ],
      // },
    ],
  },
};
