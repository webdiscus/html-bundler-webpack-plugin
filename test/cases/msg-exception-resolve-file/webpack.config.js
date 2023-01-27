const path = require('path');
const HtmlBundlerPlugin = require('../../../');

const isProduction = true;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '/',
  },

  entry: {
    index: './src/index.html',
  },

  plugins: [new HtmlBundlerPlugin()],

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
