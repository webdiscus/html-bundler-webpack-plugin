const path = require('path');
const HtmlBundlerPlugin = require('@test/html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/index.html?lang=en', // test with the query
          data: { title: 'English', headline: 'I speak English!' },
        },
        'de/index': {
          import: './src/index.html?lang=de', // test with the query
          data: { title: 'Deutsch', headline: 'Ich spreche Deutsch!' },
        },
        'nl/index': {
          import: './src/index.html', // test w/o a query
          data: { title: 'Duits', headline: 'Ik spreek Duits!' },
        },
        'da/index': {
          import: './src/index.html', // test w/o a query
          data: { title: 'Tysk', headline: 'Jeg taler tysk!' },
        },
      },

      js: {
        filename: 'assets/js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'assets/css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      // {
      //   test: /\.(png|jpe?g|ico|svg)$/,
      //   type: 'asset/resource',
      //   generator: {
      //     filename: 'assets/img/[name].[hash:8][ext]',
      //   },
      // },

      // test resolving of images in entry, containing a query
      {
        test: /\.(gif|png|jpe?g|ico|svg|webp)$/i,
        type: 'asset/resource',
        use: {
          loader: 'responsive-loader',
          options: {
            name: 'assets/img/[name]-[width]w.[ext]',
            format: 'jpg',
          },
        },
      },
    ],
  },
};
