const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@views': path.join(__dirname, 'src/views'),
      '@styles': path.join(__dirname, 'src/styles'),
      '@scripts': path.join(__dirname, 'src/scripts'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        news: './src/views/pages/news/index.pug',
        about: './src/views/pages/about/index.pug',
        index: './src/views/pages/index.pug',
      },
      js: {
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        filename: 'css/[name].[contenthash:8].css',
      },
      preprocessor: 'pug',
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
