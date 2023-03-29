const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      minify: 'auto', // auto && development mode => not minify
    }),
  ],
};
