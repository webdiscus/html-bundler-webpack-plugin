const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: 'src/index.html',
          data: 'src/data.mjs', // test: ESM .mjs file
        },
      },
      //data: 'src/data.mjs',
    }),
  ],
};
