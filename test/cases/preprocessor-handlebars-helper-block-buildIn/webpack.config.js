const path = require('path');
const HtmlBundlerPlugin = require('../../../');

const config = {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, './dist'),
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/views/pages/home/index.hbs',
          data: { title: 'Homepage' },
        },
        // test: the `title` is defined using the `assign` helper
        about: './src/views/pages/about/index.hbs',
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        partials: [path.join(__dirname, 'src/views/pages/'), path.join(__dirname, 'src/views/partials/')],
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ico|png|jp?g|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};

module.exports = config;
