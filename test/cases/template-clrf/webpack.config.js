const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const ejs = require('ejs');

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
          data: { title: 'Test' },
        },
      },

      js: {
        // output filename of extracted JS
        filename: 'assets/js/[name].[contenthash:8].js',
      },

      loaderOptions: {
        // test: when template contain CRLF and used EJS compiler then occur the error: Unterminated string constant
        preprocessor: (template, { data }) => ejs.render(template, data),
      },
    }),
  ],
};
