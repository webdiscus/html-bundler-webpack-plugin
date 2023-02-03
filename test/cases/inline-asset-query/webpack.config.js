const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  resolve: {
    alias: {
      Images: path.join(__dirname, 'src/assets/images/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/views/index.html',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
      },

      // image file, without query `?inline`
      {
        test: /\.(png|jpe?g|webp|ico|svg)$/i,
        resourceQuery: { not: [/inline/] },
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },

      // inline svg, with query `?inline`
      {
        test: /\.(png|jpe?g|webp|ico|svg)$/i,
        resourceQuery: /inline/,
        type: 'asset/inline',
      },
    ],
  },
};
