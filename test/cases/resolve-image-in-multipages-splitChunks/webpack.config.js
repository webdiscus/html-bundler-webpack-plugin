const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/home.html',
        about: './src/about.html',
      },

      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|jpe?g|webp|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },

  optimization: {
    splitChunks: {
      chunks: 'all', // <= DO NOT use this here, it doesn't make sense because we will split only scripts in a group
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/].+\.(js|ts)$/, // <= IMPORTANT: split only script files
          name: 'vendor',
          chunks: 'all', // <= DEFINE `chunks: 'all'` only in a cache group
        },
        default: {
          minChunks: 2,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
  },
};
