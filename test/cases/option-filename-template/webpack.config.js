const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: {
      import: './src/views/index.html',
      filename: '[name].html', // => dist/index.html
    },
    sport: {
      import: './src/views/sport.html',
      filename: './news/[name].html', // => dist/news/sport.html
    },
    about: './src/views/about.html', // => dist/about-en.html
  },

  plugins: [
    new HtmlBundlerPlugin({
      filename: '[name]-en.html',
    }),
  ],
};
