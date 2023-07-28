const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

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
      css: {
        filename: 'css/[name].bundle.css',
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

  optimization: {
    minimizer: [
      // test css optimisation
      new CssMinimizerPlugin(),
    ],
  },
};
