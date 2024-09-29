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
          import: './src/views/pages/home.ejs', // ESJ template
          data: {
            title: 'Home',
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
        about: {
          import: './src/views/pages/about.hbs', // Handlebars template
          data: {
            title: 'About',
            headline: 'Breaking Bad',
            people: ['Gustavo Fring', 'Michael Ehrmantraut'],
          },
        },
        news: 'src/views/pages/news.ejs',
        contact: 'src/views/pages/contact.hbs',
      },
    }),
  ],

  // to use different preprocessor template engines,
  // each engine must be defined in module.rules for own template file extension
  module: {
    rules: [
      {
        test: /\.ejs$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: 'ejs', // <= use EJS
          preprocessorOptions: {
            views: ['src/views/partials'], // a relative or absolute path
          },
          data: {
            title: 'Ejs',
          },
        },
      },
      {
        test: /\.hbs$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: 'handlebars', // <= use Handlebars
          preprocessorOptions: {
            views: ['src/views/partials'], // relative or absolute path
          },
          data: {
            title: 'Handlebars',
          },
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
