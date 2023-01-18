const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [new HtmlBundlerPlugin()],

  module: {
    rules: [
      {
        test: /\.html$/,
        loader: HtmlBundlerPlugin.loader,
      },

      {
        test: /\.(png|jpg|svg)/,
        type: 'asset/inline',
      },
    ],
  },
};
