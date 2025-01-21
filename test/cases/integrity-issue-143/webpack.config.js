const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist/'),
    crossOriginLoading: 'anonymous',
  },
  resolve: {
    alias: {
      '@src': path.join(__dirname, 'src'),
    },
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
      integrity: true, // fix: cause own error and masks original error
    }),
  ],
  module: {
    // disable the CSS rule to simulate the exception,
    // but the original error what in will not be displayed because the `integrity` module cause own error
    // rules: [
    //   {
    //     test: /\.(css)$/,
    //     use: [
    //       {
    //         loader: 'css-loader',
    //       },
    //     ],
    //   },
    // ],
    defaultRules: ['...'],
  },
};
