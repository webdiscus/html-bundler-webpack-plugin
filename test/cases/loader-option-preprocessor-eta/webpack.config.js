const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const Eta = require('eta');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|ejs|eta)$/,
      entry: {
        index: {
          import: './src/home.eta',
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
        test: /\.(html|ejs|eta)$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          // note: set the `useWith: true` option to use data in template without `it.` scope
          preprocessor: (content, { data }) => Eta.render(content, data, { useWith: true }),
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
