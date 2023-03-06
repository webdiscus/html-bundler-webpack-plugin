const fs = require('fs');
const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const Handlebars = require('handlebars');

// create the 'include' helper to load partials in a template
Handlebars.registerHelper('include', (filename) => fs.readFileSync(`${process.cwd()}/${filename}`, 'utf8'));

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|hbs)$/,
      entry: {
        index: {
          import: './src/home.hbs',
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
