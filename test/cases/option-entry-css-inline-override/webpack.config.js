const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/index.html',
          css: { inline: true },
        },
        about: './src/about.html',
      },
      css: {
        inline: false,
        filename: 'assets/css/[name].css',
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
      // рequired for minified CSS
      new CssMinimizerPlugin(),
    ],
  },
};
