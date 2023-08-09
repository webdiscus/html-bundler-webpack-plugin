const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },

      js: {
        filename: 'js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },

  optimization: {
    runtimeChunk: true,
    //runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      minSize: 500,
      maxSize: 500,
      cacheGroups: {
        defaultVendors: {
          name: 'vendor',
          chunks: 'all',
          //test: /[\\/]node_modules[\\/]/,
          //test: /\.(js)$/,
          test: /\.(css|scss)$/,
          enforce: true,
        },
      },
    },
  },
};
