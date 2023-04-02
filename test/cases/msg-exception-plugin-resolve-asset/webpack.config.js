const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
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
