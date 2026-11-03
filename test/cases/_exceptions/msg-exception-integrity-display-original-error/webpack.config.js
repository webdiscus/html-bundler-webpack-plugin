const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  experiments: {
    // Preserve Webpack <= 5.105 behavior for this compatibility test:
    // without a CSS loader, CSS must produce the original missing-loader error.
    css: false,
  },
  output: {
    crossOriginLoading: 'anonymous',
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
    // fixed: the original error what in will not be displayed because the `integrity` module cause own error
    // rules: [
    //   {
    //     test: /\.(css)$/,
    //     use: ['css-loader'],
    //   },
    // ],
  },
};
