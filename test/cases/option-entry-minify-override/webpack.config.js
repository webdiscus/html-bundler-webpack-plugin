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
          import: './src/index.html',
          minify: true,
        },
        about: './src/about.html',
      },
      minify: false,
    }),
  ],
};
