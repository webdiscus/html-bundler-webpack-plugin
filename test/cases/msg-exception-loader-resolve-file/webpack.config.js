const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.html/,
        use: [
          {
            loader: HtmlBundlerPlugin.loader,
          },
        ],
      },
    ],
  },
};
