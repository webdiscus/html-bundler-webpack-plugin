const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  //mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.hbs',
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        strict: true,
        views: ['src/partials'],
      },
    }),
  ],

  module: {
    rules: [],
  },
};
