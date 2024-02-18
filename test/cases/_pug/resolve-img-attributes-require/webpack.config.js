const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../../fixtures/images'),
      '@scripts': path.join(__dirname, 'src/scripts'),
      '@styles': path.join(__dirname, 'src/styles'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.pug',
      },
      preprocessor: 'pug',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(ico|png|jp?g|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
