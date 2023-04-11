const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      verbose: true, // test verbose for 'asset/source'
      entry: {
        index: './src/index.html',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(svg)$/,
        type: 'asset/source', // test type 'asset/source' for SVG
      },
    ],
  },
};
