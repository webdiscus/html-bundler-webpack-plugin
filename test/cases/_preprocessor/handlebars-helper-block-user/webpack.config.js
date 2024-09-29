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
        about: {
          import: './src/views/pages/about/index.hbs',
          data: { title: 'About' },
        },
      },

      preprocessor: 'handlebars',
      preprocessorOptions: {
        // test override build-in plugin helpers with own helper
        helpers: [path.join(__dirname, 'src/views/helpers')],
        partials: [path.join(__dirname, 'src/views/pages/'), path.join(__dirname, 'src/views/partials/')],
      },
    }),
  ],
};

module.exports = config;
