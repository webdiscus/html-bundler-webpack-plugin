const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',

  output: {
    path: path.join(__dirname, 'dist/'),
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

  // test using multiple templating engines
  module: {
    rules: [
      {
        test: /\.ejs$/,
        loader: HtmlBundlerPlugin.loader,
        options: {
          preprocessor: 'ejs', // require installed ejs package
          preprocessorOptions: {
            views: [path.join(process.cwd(), 'src/views/partials')],
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
          preprocessor: 'handlebars', // require installed handlebars package
          preprocessorOptions: {
            views: [path.join(process.cwd(), 'src/views/partials')],
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
