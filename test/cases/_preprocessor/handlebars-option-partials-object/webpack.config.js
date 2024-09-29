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
            headline: 'Breaking Bad',
            people: ['Walter White', 'Jesse Pinkman'],
          },
        },
      },

      preprocessor: 'handlebars',
      preprocessorOptions: {
        // define partials manually
        partials: {
          gallery: path.join(__dirname, 'src/views/includes/gallery.html'),
          teaser: path.join(__dirname, 'src/views/includes/teaser.hbs'),
          header: path.join(__dirname, 'src/views/partials/header.html'),
          footer: path.join(__dirname, 'src/views/partials/footer.html'),
          'menu/nav': path.join(__dirname, 'src/views/partials/menu/nav.html'),
          'menu/aside/left': path.join(__dirname, 'src/views/partials/menu/aside/left.html'),
          'menu/aside/right': path.join(__dirname, 'src/views/partials/menu/aside/right.hbs'),
          'menu/top/desktop': path.join(__dirname, 'src/views/partials/menu/top/desktop.html'),
          'menu/top/mobile': path.join(__dirname, 'src/views/partials/menu/top/mobile.hbs'),
        },
      },
    }),
  ],

  module: {
    rules: [
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
