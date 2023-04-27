const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: 'source-map',

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
        index: './src/index.html',
      },

      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },

      //verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)/,
        // use: ['css-loader', 'sass-loader'], // the mapping is wrong

        // test the mapping to a correct code line in not minified css, contained a post-updated url()
        use: ['css-loader'], // the mapping is correct
      },

      {
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          // the generated file path must be longer then raw request to test the correct mapping to a code line
          filename: 'assets/img/[name].[hash][ext]',
        },
      },
    ],
  },
};
