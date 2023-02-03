const path = require('path');
const HtmlBundlerPlugin = require('../../../');
const ejs = require('ejs');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      test: /\.(html|ejs)$/,
      entry: {
        index: {
          import: './src/home.ejs',
          data: {
            title: 'Breaking Bad',
            firstname: 'Walter',
            lastname: 'Heisenberg',
          },
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(html|ejs)$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: (content, { data }) => ejs.render(content, data),
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
