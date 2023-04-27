const path = require('path');
const HtmlBundlerPlugin = require('../../../');

const PATHS = {
  pages: path.join(__dirname, 'src/views/pages/'),
  partials: path.join(__dirname, 'src/views/partials/'),
  helpers: path.join(__dirname, 'src/views/helpers/'),
};

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
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
        preprocessor: 'handlebars',
        preprocessorOptions: {
          views: [PATHS.partials],
        },
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
