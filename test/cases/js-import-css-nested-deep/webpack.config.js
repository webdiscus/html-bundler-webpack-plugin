const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

// test: fix of the issue #68

module.exports = {
  mode: 'production',
  //mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      //entry: 'src/',
      entry: {
        pageA: './src/pages/pageA.html',
        pageB: './src/pages/pageB.html',
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
        test: /\.(css)$/,
        use: ['css-loader'],
      },
    ],
  },

  optimization: {
    usedExports: true,
  },
};
