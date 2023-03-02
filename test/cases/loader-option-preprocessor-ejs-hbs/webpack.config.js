const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const ejs = require('ejs');
const Handlebars = require('handlebars');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(ejs|hbs)$/,
      entry: {
        index: {
          import: './src/home.ejs', // ESJ template
          data: {
            title: 'Home',
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
        about: {
          import: './src/about.hbs', // Handlebars template
          data: {
            title: 'About',
            headline: 'Breaking Bad',
            people: ['Gustavo Fring', 'Michael Ehrmantraut'],
          },
        },
      },
    }),
  ],

  // test using multiple templating engines
  module: {
    rules: [
      {
        test: /\.ejs$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: (content, { data }) => ejs.render(content, data),
        },
      },
      {
        test: /\.hbs$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: (content, { data }) => Handlebars.compile(content)(data),
        },
      },
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
