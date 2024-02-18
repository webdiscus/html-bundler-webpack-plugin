const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
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
        test: /\.(png|webp|jpe?g)$/,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            // image output filename
            name: 'img/[name]-[width]w.[ext]',
            //name: 'img/[name].[hash:8]-[width]w.[ext]', // note: GitHub generate different hash
          },
        },
      },
    ],
  },
};
