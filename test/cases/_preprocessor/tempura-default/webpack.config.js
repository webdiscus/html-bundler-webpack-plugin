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
        index: {
          import: './src/views/pages/home.hbs',
          data: {
            title: 'Home',
            header: 'My header',
            items: [
              { id: 1, text: 'Feed the doggo' },
              { id: 2, text: 'Buy groceries' },
              { id: 3, text: 'Exercise, ok' },
            ],
          },
        },
      },
      preprocessor: 'tempura',
      preprocessorOptions: {
        // root path for all included partials
        root: path.join(__dirname, 'src/views/'),
        // find included partials in the paths
        views: [path.join(__dirname, 'src/views/partials/')],
      },
      js: {
        filename: 'js/[name].[contenthash:8].js', // JS output filename
      },
      css: {
        filename: 'css/[name].[contenthash:8].css', // CSS output filename
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
};
