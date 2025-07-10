const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

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
        // test: the `title` is template defined using the `assign` helper
        about: './src/views/pages/about/index.hbs',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        partials: [
          // paths to partials used in page templates
          path.join(__dirname, 'src/views/pages/'),
          path.join(__dirname, 'src/views/partials/'),
        ],
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: ['css-loader'],
      },
    ],
  },
};

module.exports = config;
