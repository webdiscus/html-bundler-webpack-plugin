const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const Handlebars = require('handlebars');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  entry: {
    index: './src/home.hbs',
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|hbs)$/,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(html|hbs)$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: (content, loaderContext) =>
            Handlebars.compile(content)({
              title: 'Breaking Bad',
              firstname: 'Walter',
              lastname: 'Heisenberg',
            }),
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
