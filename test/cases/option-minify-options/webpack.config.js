const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  //mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      //minify: 'auto', // auto && production mode => minify TODO: add separate test
      //minify: false, // disabled TODO: add separate test
      //minify: true, // enabled
      minify: {
        minifyCSS: false,
        minifyJS: true,
      },
    }),
  ],
};
