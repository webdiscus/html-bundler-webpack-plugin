const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

// data used in the home template
const homeData = {
  title: 'Handlebars',
  persons: [
    { name: 'Nils', age: 20 },
    { name: 'Robert', age: 10 },
    { name: 'Margaret', age: 40 },
  ],
};

module.exports = {
  mode: 'development',

  output: {
    path: path.resolve(__dirname, 'dist'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: {
          import: 'src/views/pages/home.hbs', // => dist/index.html
          // pass data to template as an object
          // data: homeData,
          // OR define the data file
          data: 'src/views/pages/homeData.js',
        },
      },
      // specify the `handlebars` template engine
      preprocessor: 'handlebars',
      // define handlebars options
      preprocessorOptions: {
        partials: ['src/views/partials'],
        helpers: {
          arraySize: (array) => array.length,
        },
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

  // enable HMR with live reload
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
