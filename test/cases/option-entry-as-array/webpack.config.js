const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      // test: entry as the array
      entry: [
        {
          filename: 'index.html',
          import: 'src/views/index.html',
          data: { title: 'Homepage' },
        },
        {
          filename: 'about.html',
          import: 'src/views/about.html',
          data: { title: 'About' },
        },
        {
          filename: 'news/sport.html',
          import: 'src/views/news/sport.html',
          data: { title: 'Sport' },
        },
      ],
    }),
  ],
};
