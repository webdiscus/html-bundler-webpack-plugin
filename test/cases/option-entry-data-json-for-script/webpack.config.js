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
          data: {
            title: 'Test JSON',
            testJSON: JSON.stringify(require('./src/data.json')), // pass JSON as a string into `<script>` tag
          },
        },
      },
      preprocessor: 'eta',
      preprocessorOptions: {
        autoEscape: false, // important: disable escaping of JSON string in HTML for using in `<script>` tag
      },
    }),
  ],
};
