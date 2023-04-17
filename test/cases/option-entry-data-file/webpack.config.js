const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: 'src/views/home/index.html',
          data: 'src/views/home/data.js', // load page data from JS file
        },

        'news/sport': {
          import: 'src/views/news/sport/index.html',
          data: {
            title: 'Sport', // data as object
          },
        },
      },

      loaderOptions: {
        data: 'src/data/global.json', // load global data from JSON file
      },
    }),
  ],
};
