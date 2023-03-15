const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const Handlebars = require('handlebars');

const PATHS = {
  pages: path.join(__dirname, 'src/views/pages/'),
  partials: path.join(__dirname, 'src/views/partials/'),
  helpers: path.join(__dirname, 'src/views/helpers/'),
};

// register the 'include' helper to load partials in a template
Handlebars.registerHelper(
  'include',
  require(path.join(PATHS.helpers, 'include'))({ root: PATHS.partials, ext: '.hbs' })
);

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, 'src/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|hbs)$/,
      entry: {
        index: {
          import: './src/views/pages/home.hbs',
          data: {
            title: 'Home',
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },
      loaderOptions: {
        preprocessor: (content, { data }) => Handlebars.compile(content)(data),
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
