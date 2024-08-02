const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  name: 'first',
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/output1/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/home.html',
      },
      preprocessor: 'handlebars',
    }),
  ],
};
