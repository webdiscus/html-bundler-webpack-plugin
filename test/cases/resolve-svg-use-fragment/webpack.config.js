const path = require('path');
const HtmlBundlerPlugin = require('../../../');

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
          // test: resolve SVG file with fragment w/o '[fragment]' in filename
          // <svg width="24" height="24"><use href="./icons.svg#home"></use></svg>
          filename: 'assets/img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
