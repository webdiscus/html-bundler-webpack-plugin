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
          import: './src/views/home.hbs',
          data: './src/views/data.json',
        },
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        partials: [path.join(__dirname, './src/partials/')],
      },
    }),
  ],
};
