const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'inline-source-map',

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

  optimization: {
    minimizer: [
      // test css optimisation for inlined CSS imported in js with source mapping
      new CssMinimizerPlugin(),
    ],
  },
};
