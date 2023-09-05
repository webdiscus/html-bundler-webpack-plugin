const path = require('path');
//const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const HtmlBundlerPlugin = require('../../');

module.exports = {
  //mode: 'development',
  mode: 'production',

  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  resolve: {
    alias: {
      '@scripts': path.join(__dirname, 'src/js'),
      '@styles': path.join(__dirname, 'src/scss'),
      '@images': path.join(__dirname, 'src/images'),
    },
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: 'src/views/pages/home/index.hbs', // => dist/index.html
        // index: {
        //   import: 'src/views/pages/home/index.hbs',
        //   data: { title: 'Home' },
        // },
        about: 'src/views/pages/about/index.hbs', // => dist/about.html
      },
      // specify the `handlebars` template engine
      preprocessor: 'handlebars',
      // define handlebars options
      preprocessorOptions: {
        //helpers: [path.join(__dirname, 'src/views/helpers')], // enable to use own helpers
        partials: ['src/views/pages/', 'src/views/partials/'],
      },
      js: {
        // output filename of compiled JavaScript
        filename: 'js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS
        filename: 'css/[name].[contenthash:8].css',
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: ['css-loader', 'sass-loader'],
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

  // enable live reload
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    watchFiles: {
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};
