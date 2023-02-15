const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const Handlebars = require('handlebars');

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
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(html|hbs)$/,
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
