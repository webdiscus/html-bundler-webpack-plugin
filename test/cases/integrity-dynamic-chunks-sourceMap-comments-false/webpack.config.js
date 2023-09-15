const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: 'source-map', // test source map

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
        // filename: '[name].bundle.js', // OK
        filename: '[name].[contenthash:8].js', // Note: the dist must be force cleaned using the `output.compareBeforeEmit:false`
        //chunkFilename: '[name].[contenthash:8].chunk.js',
      },

      extractComments: false, // test remove comments

      integrity: 'auto',
    }),
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
    // test split chunks for dynamic loaded modules OK
    chunkIds: 'named',
  },
};
