const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  stats: {
    children: true,
  },

  mode: 'production',

  resolve: {
    alias: {
      Includes: path.join(__dirname, 'src/includes/'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
    publicPath: '',
  },

  entry: {
    index: 'src/views/index.pug',
  },

  plugins: [
    new HtmlBundlerPlugin({
      preprocessor: 'pug',
      preprocessorOptions: {
        embedFilters: {
          escape: true,
        },
      },
    }),
  ],
};
