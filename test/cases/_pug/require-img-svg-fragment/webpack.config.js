const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: 'src/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {},
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
