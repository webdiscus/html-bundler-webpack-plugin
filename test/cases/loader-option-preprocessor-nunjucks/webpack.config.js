const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

const entryData = {
  home: {
    title: 'Home',
    filmTitle: 'Breaking Bad',
    description: 'Breaking Bad is an American crime drama',
    city: 'Albuquerque',
    state: 'New Mexico',
    imageFile: 'apple.png',
    imageAlt: 'location',
  },
  about: {
    title: 'About',
    headline: 'Breaking Bad',
    people: [
      {
        firstname: 'Walter',
        lastname: 'White',
      },
      {
        firstname: 'Jesse',
        lastname: 'Pinkman',
      },
    ],
  },
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
          import: 'src/views/pages/home/index.html',
          data: entryData.home,
        },
        about: {
          import: 'src/views/pages/about/index.njk', // test .njk extension
          data: entryData.about,
        },
      },
      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      loaderOptions: {
        preprocessor: 'nunjucks',
        preprocessorOptions: {
          views: ['src/views/layouts/', 'src/views/includes/'],
          jinjaCompatibility: true, // test the installation of jinja compatibility mode
          // config options https://mozilla.github.io/nunjucks/api.html#configure
          autoescape: true,
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|webp|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
