const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  //mode: 'development',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      App: path.join(__dirname, 'src/app/'),
      Views: path.join(__dirname, 'src/views/'),
      Images: path.join(__dirname, 'src/assets/images/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
      Scripts: path.join(__dirname, 'src/assets/scripts/'),
    },
  },

  entry: {
    index: 'src/views/pages/home/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      preprocessor: 'pug',
      preprocessorOptions: {},
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
