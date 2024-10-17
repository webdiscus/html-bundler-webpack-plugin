const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'production',
  stats: 'minimal',

  resolve: {
    alias: {
      '@images': path.join(__dirname, '../../fixtures/images'),
    },
  },

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      verbose: true,

      entry: [
        {
          import: 'src/views/pages/home.hbs',
          filename: 'index.html',
          data: 'src/views/pages/home-data.json',
        },
        {
          import: 'src/views/pages/about.hbs',
          filename: 'about.html',
          data: 'src/views/pages/about-data.json',
        },
      ],

      // test: issue after 2-3 changes of the `data-global.json` or `home-data.json`, the index.html is not recompiled
      data: 'data-global.json',

      preprocessor: 'handlebars',
      preprocessorOptions: {
        helpers: ['src/views/helpers'],
        partials: ['src/views/includes', 'src/views/partials'],
      },

      hotUpdate: true, // test this option
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

  // enable live reload
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
