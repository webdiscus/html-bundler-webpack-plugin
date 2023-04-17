const path = require('path');
const HtmlBundlerPlugin = require('../../../');

module.exports = {
  mode: 'production',
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      verbose: true,

      entry: {
        index: {
          import: 'src/views/pages/home.hbs',
          data: 'src/views/pages/home-data.json',
        },

        about: {
          import: 'src/views/pages/about.hbs',
          data: 'src/views/pages/about-data.json',
        },
      },

      loaderOptions: {
        data: 'data-global.json',
        preprocessor: 'handlebars',
        preprocessorOptions: {
          partials: [
            // relative or absolute paths to partials
            'src/views/includes',
            'src/views/partials',
          ],
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

  // enable HMR with live reload
  devServer: {
    //hot: false,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: {
      paths: ['src/**/*.*', 'data-global.json'],
      options: {
        usePolling: true,
      },
    },
  },
};
