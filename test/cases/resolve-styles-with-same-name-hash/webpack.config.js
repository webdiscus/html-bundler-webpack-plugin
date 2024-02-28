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
        home: './src/views/home/index.html',
        about: './src/views/about/index.html',
        mix: './src/views/mix/index.html',
      },
      css: {
        // test conflict: Multiple chunks emit assets to the same filename
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader'],
      },
    ],
  },
};
