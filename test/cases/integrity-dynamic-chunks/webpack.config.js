const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');

module.exports = {
  //mode: 'development',
  mode: 'production',
  target: 'web',

  output: {
    path: path.join(__dirname, 'dist/'),
    crossOriginLoading: 'anonymous', // required for test Subresource Integrity
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: '[name].bundle.js',
      },
    }),
    new SubresourceIntegrityPlugin(), // test Subresource Integrity
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  optimization: {
    chunkIds: 'named',
  },
};
