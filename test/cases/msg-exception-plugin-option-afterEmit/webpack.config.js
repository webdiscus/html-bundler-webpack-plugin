const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      // test error in function
      afterEmit: (entries) => {
        //console.dir({ entries }, { depth: 5 });
        throw new Error('afterEmit failed!');
      },

      // test error in promise
      // afterEmit: (entries) =>
      //   new Promise((resolve) => {
      //     //console.dir({ entries }, { depth: 5 });
      //     throw new Error('afterEmit failed!');
      //     resolve();
      //   }),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
    ],
  },
};
