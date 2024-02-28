const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
      Styles: path.join(__dirname, 'src/assets/styles/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    'pages/home': './src/views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      js: {
        filename: '[name].[contenthash:8].js',
      },
    }),
  ],

  module: {
    rules: [
      // images loader
      {
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            // image output filename
            // note: github generate different hash as local test
            //name: 'assets/img/[name].[hash:8]-[width]w.[ext]',
            name: 'img/[name]-[width]w.[ext]',
            sizes: [100], // default size for all images
          },
        },
      },
    ],
  },
};
