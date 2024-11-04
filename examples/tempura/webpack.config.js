const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

// data used in the home template
const homeData = {
  title: 'Tempura',
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
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        // define templates here
        index: {
          import: 'src/views/pages/home.hbs', // => dist/index.html
          // pass data to template as an object
          data: homeData,
          // OR define the data file
          //data: 'src/views/pages/homeData.js',
        },
      },
      preprocessor: 'tempura', // use the `tempura` template engine
      preprocessorOptions: {
        views: ['src/views/partials'], // find including partials in these directories
        blocks: {
          // define custom helpers
          bar: ({ value }) => `<bar>${value}</bar>`,
        },
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
