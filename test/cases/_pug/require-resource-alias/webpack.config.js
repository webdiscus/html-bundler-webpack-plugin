const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '',
  },

  resolve: {
    alias: {
      Source: path.join(__dirname, 'src/'),
      SourceImages: path.join(__dirname, 'src/images/'),
    },
  },

  entry: {
    index: 'src/views/index.pug',
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
        test: /\.(png|webp|jpe?g)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
