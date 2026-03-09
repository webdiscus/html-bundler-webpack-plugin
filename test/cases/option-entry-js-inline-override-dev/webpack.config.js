const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/index.html',
          js: { inline: true },
        },
        about: './src/about.html',
      },
      js: {
        inline: false,
        filename: 'assets/js/[name].js',
      },
    }),
  ],
};
