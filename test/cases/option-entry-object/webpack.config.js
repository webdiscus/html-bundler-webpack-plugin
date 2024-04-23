const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      // test: entry as the object
      entry: {
        index: {
          import: 'src/views/index.html',
          data: { title: 'Homepage' },
        },
        about: {
          import: 'src/views/about.html',
          data: { title: 'About' },
        },
        'news/sport': {
          import: 'src/views/news/sport.html',
          data: { title: 'Sport' },
        },
      },
    }),
  ],
};
