const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
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
        test: /\.(png|jpe?g|ico|svg)$/,
        type: 'asset/resource',
        generator: {
          // test: remove [fragment] in output asset filename
          // note: the '[fragment]' is used in filename for use SVG fragments
          // <svg width="24" height="24"><use href="./icons.svg#home"></use></svg>
          filename: 'assets/img/[name].[hash:8][ext][fragment][query]',
        },
      },
    ],
  },
};
