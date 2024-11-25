const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',

  devtool: false,

  output: {
    path: path.join(__dirname, 'dist/'),
    clean: true,
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: './src/home.html',

        // TODO: add support HMR for styles defined in HTML
        // 'style-a': {
        //   library: {
        //     name: ' ',
        //     type: 'jsonp',
        //     //type: 'commonjs2',
        //   },
        //   import: './src/style-a.css',
        //   filename: 'style-a.js',
        // },
      },

      js: {
        filename: 'js/[name].[contenthash:8].js',
      },

      css: {
        filename: 'css/[name].[contenthash:8].css',
        inline: true,
        hot: true,
      },

      //verbose: true,
      //hotUpdate: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(css)/,
        use: ['css-loader'],
      },
    ],
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },

    //hot: false, // // default is true, enable HMR (works for CSS only)

    watchFiles: {
      paths: ['src/**/*.(html|eta)'], // if the `hot` option is enabled then exclude *.s?css from watched files
      //paths: ['src/**/*.*'], // if the `hot` option is enabled then exclude *.s?css from watched files
      options: {
        usePolling: true,
      },
    },
  },
};
