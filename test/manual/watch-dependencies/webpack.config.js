const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

const config = {
  mode: 'production',
  stats: 'minimal',

  output: {
    path: path.join(__dirname, 'dist/'),
  },

  plugins: [
    new HtmlBundlerPlugin({
      // auto processing templates in the path
      entry: './src/views/pages/',

      // define templates manual
      // entry: {
      //   index: {
      //     import: './src/views/pages/home.html',
      //     // the template data
      //     data: {
      //       title: 'Home',
      //     },
      //   },
      // },

      // test: configure paths to watch file changes
      // watchFiles: {
      //   paths: ['./src'],
      //   //files: [/\.(html|js|sc?ss)$/],
      //   //ignore: [],
      // },

      data: { title: 'Home' }, // global data for all templates
      hotUpdate: true, // <= use it only if your html don't have a js file
      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(png|jpe?g|svg|webp|ico)$/i,
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
      paths: ['src/**/*.*'],
      options: {
        usePolling: true,
      },
    },
  },
};

//console.log(config);

module.exports = config;
