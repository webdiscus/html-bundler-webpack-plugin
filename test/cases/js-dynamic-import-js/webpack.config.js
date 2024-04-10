const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [
    new HtmlBundlerPlugin({
      js: {
        chunkFilename: '[name].[chunkhash:4].js',
        //inline: true,
      },
      css: {
        // test: css.inline=true with magic comments in js /* webpackChunkName: "prefetched", webpackPrefetch: true */
        inline: true,
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
    ],
  },
};
