const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/index.html',
      },
      preprocessor: 'nunjucks',
      preprocessorOptions: {
        // Note: Template includes by precompilation must be relative to the template root dirs,
        views: [
          // test: filter unique paths
          path.join(__dirname),
          path.join(__dirname, 'src'),
          path.join(__dirname, 'src/partials'),
          path.join(__dirname, 'src/partials'),
        ],
      },
      data: {
        title: 'My Title',
        utils: {
          // test: call the function in template
          getTitle: (str) => `My '${str}' title`,
        },
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(ico|png|jpe?g|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
};
