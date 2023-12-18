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

      loaderOptions: {
        preprocessor: false,
      },
    }),
  ],

  module: {
    rules: [
      // test: Module parse failed without the loader
      // {
      //   test: /\.(jpe?g|png)$/,
      //   type: 'asset/resource',
      //   generator: {
      //     filename: 'assets/img/[name].[hash:8][ext]',
      //   },
      // },
    ],
  },
};
